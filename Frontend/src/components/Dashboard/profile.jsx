// import React, { useEffect, useState } from "react";
// import { auth, db } from "../Authentication/firebase";
// import { doc, getDoc } from "firebase/firestore";

// function Profile() {
//   const [userDetails, setUserDetails] = useState(null);
//   const fetchUserData = async () => {
//     auth.onAuthStateChanged(async (user) => {
//       console.log(user);

//       const docRef = doc(db, "Users", user.uid);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         setUserDetails(docSnap.data());
//         console.log(docSnap.data());
//       } else {
//         console.log("User is not logged in");
//       }
//     });
//   };
//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   async function handleLogout() {
//     try {
//       await auth.signOut();
//       window.location.href = "/login";
//       console.log("User logged out successfully!");
//     } catch (error) {
//       console.error("Error logging out:", error.message);
//     }
//   }
//   return (
//     <div>
//       {userDetails ? (
//         <>
//           <div style={{ display: "flex", justifyContent: "center" }}>
//             <img
//               src={userDetails.photo}
//               width={"40%"}
//               style={{ borderRadius: "50%" }}
//             />
//           </div>
//           <h3>Welcome {userDetails.firstName}</h3>
//           <div>
//             <p>Email: {userDetails.email}</p>
//             <p>First Name: {userDetails.firstName}</p>
//             <p>Last Name: {userDetails.lastName}</p>
//           </div>
//           <button className="btn btn-primary" onClick={handleLogout}>
//             Logout
//           </button>
//         </>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// }
// export default Profile;

import DashboardLayout from "./dashboard/DashboardLayout"
import RecentInteractions from "./dashboard/RecentInteractions"
import DrugSearchPanel from "./dashboard/DrugSearchPanel"
import Appointments from "./dashboard/Appointments"
import Reminders from "./dashboard/Reminders"
import { Box } from "@chakra-ui/react"
import React, { useEffect, useState } from "react";



export default function Profile() {


  return (
    <>
      <DashboardLayout />
      <Box display="flex" flexDirection="column" gap={6}>
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <DrugSearchPanel />
          <RecentInteractions />
          <Appointments />
          <Reminders />
        </Box>
      </Box></>

  )
}