import React from "react";
//import { Button } from "@/components/ui/button"; // Or just use a <button> if you don't use shadcn/ui
import Button from "@uiElements/Button";

export default function QuickActions({ onCreateRental, onAddInventory, onIssueInvoice, onSchedulePickup }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4 flex gap-4">
      <Button onClick={onCreateRental}>Create New Rental</Button>
      <Button onClick={onAddInventory}>Add Inventory</Button>
      <Button onClick={onIssueInvoice}>Issue Invoice/Payment Reminder</Button>
      <Button onClick={onSchedulePickup}>Schedule Pickup/Delivery</Button>
    </div>
  );
}
