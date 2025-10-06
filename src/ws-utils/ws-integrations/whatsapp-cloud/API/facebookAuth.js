import { toast } from "react-toastify";
import { API_BASE_URL, APP_ID } from "@config";
import { fetchJson } from "@utils/fetchJson";
import Cookies from 'js-cookie';

export const loadFacebookSDK = () => {
    return new Promise((resolve, reject) => {
        // --- Validation 1: APP_ID Check ---
        if (!APP_ID) {
            const errorMsg = "Facebook App ID is missing in configuration (@config). Cannot initialize SDK.";
            toast.error(errorMsg);
            console.error(errorMsg);
            // Reject the promise if configuration is missing
            reject(new Error(errorMsg)); 
            return;
        }
        // -----------------------------------

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: APP_ID,
                cookie: true,
                xfbml: true,
                version: "v17.0",
            });
            resolve();
        };
        (function (d, s, id) {
            let js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "facebook-jssdk");
    });
}

export const sendAccessToken = async (accessToken, company_id, setConfiguration) => {
    console.log('company_id : ', company_id);

    // --- Validation 2: accessToken and company_id Check ---
    if (!company_id || !accessToken) {
        toast.error("Company ID and Access Token are required to authorize WhatsApp.");
        return false;
    }
    // -----------------------------------------------------

    try {
        const res = await fetchJson(`${API_BASE_URL}/whatsapp/authorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_id: company_id, access_token: accessToken }),
        });
        if (res?.flag !== "S") toast.error(`${res.msg}`);
        setConfiguration(c => ({
            ...c,
            config_json: res.data ? JSON.parse(res.data) : {}
        }));

        return res?.flag === "S";

    } catch (e) {
        toast.error("Network error while sending access token.");
        return false;
    }
};

export const clearAccessToken = async (accessToken, company_id) => {
    // Note: The accessToken is not used in the body but is a parameter.
    // The company_id is the critical data for the API call.

    // --- Validation 3: company_id Check ---
    if (!company_id) {
        toast.error("Company ID is required to clear the token.");
        return false;
    }
    // --------------------------------------
    try {
        const res = await fetchJson(`${API_BASE_URL}/clearToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_id: company_id, type: 'facebook' }),
        });
        if (res?.flag !== "S") toast.error(`${res.msg}`);
        return res?.flag === "S";
    } catch (e) {
        toast.error("Network error while clearing access token.");
        return false;
    }
};