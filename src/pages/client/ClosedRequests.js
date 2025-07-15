import React from "react";
import RequestList from "../../components/client/RequestList";

const ClosedRequests = () => {
  return <RequestList title="קריאות סגורות" requestType="closed" />;
};

export default ClosedRequests;
