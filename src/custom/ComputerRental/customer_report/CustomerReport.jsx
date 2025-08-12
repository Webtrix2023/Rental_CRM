import React, { useState } from "react";
import CustomerEquipmentReport from "./CustomerEquipmentReport";
import { useParams } from "react-router-dom";

export default function CustomerReport() {
  // State and handlers as before...
  const { record_id } = useParams();
    return (
      <CustomerEquipmentReport customer_id={record_id} customerName=""></CustomerEquipmentReport>
    )
};