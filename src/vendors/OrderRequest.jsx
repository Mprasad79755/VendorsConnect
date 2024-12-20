import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const VisitRequests = () => {
  const [visitRequests, setVisitRequests] = useState([]); // State to store visit requests
  const [message, setMessage] = useState(""); // Feedback message

  // Fetch visit requests from the database
  useEffect(() => {
    const fetchVisitRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "visitRequests"));
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVisitRequests(fetchedRequests);
      } catch (error) {
        console.error("Error fetching visit requests: ", error);
      }
    };

    fetchVisitRequests();
  }, []);

  // Update the 'visited' status of a request
  const handleMarkAsVisited = async (requestId) => {
    try {
      const requestRef = doc(db, "visitRequests", requestId);
      await updateDoc(requestRef, {
        visited: true,
      });
      setMessage("Status updated to visited!");

      // Update the state to reflect the change
      setVisitRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, visited: true } : request
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error);
      setMessage("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Visit Requests</h2>
      {message && <p className="text-center text-success">{message}</p>}

      {/* Table for visit requests */}
      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Address</th>
            <th>Vendor ID</th>
            <th>Time Requested</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visitRequests.length > 0 ? (
            visitRequests.map((request, index) => (
              <tr key={request.id}>
                <td>{index + 1}</td>
                <td>
  <a href={`https://google.com/maps?q=${encodeURIComponent(request.address)}`} target="_blank" rel="noopener noreferrer">
    {request.address}
  </a>
</td>

                <td>{request.vendorId}</td>
                <td>{new Date(request.timeRequested).toLocaleString()}</td>
                <td>
                  {request.visited ? (
                    <span className="badge bg-success">Visited</span>
                  ) : (
                    <span className="badge bg-warning">Pending</span>
                  )}
                </td>
                <td>
                  {!request.visited && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleMarkAsVisited(request.id)}
                    >
                      Mark as Visited
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No visit requests available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VisitRequests;
