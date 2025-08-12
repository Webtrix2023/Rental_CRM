import React from "react";
import ProductJourneyReport from "./ProductJourneyReport";
import { useParams } from "react-router-dom";

export default function CustomerReport() {
  const { record_id } = useParams();
  
  // State and handlers as before...
    return (
        <ProductJourneyReport product_id={record_id}></ProductJourneyReport>
    )
};