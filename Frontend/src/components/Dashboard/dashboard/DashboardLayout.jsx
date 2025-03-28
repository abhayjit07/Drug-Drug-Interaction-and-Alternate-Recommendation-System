import { Flex, Heading, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { auth, db } from "../../Authentication/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout() {
    const [userDetails, setUserDetails] = useState(null);
    const fetchUserData = async () => {
        auth.onAuthStateChanged(async (user) => {
            console.log(user);

            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserDetails(docSnap.data());
                console.log(docSnap.data());
            } else {
                console.log("User is not logged in");
            }
        });
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    async function handleLogout() {
        try {
            await auth.signOut();
            window.location.href = "/login";
            console.log("User logged out successfully!");
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    }

    return (
        <Flex as="nav" p="4" bg="black" color="white" justifyContent="space-between" alignItems="center">
            <Heading size="md">My App</Heading>
            <Flex gap="4">
                <Button bg="black" onClick={() => console.log("Home clicked")}>Home</Button>
                <Button bg="black" onClick={handleLogout}>Logout</Button>
            </Flex>
        </Flex>
    )
}

// return (
//     <div>
//         {userDetails ? (
//             <>
//                 <div style={{ display: "flex", justifyContent: "center" }}>
//                     <img
//                         src={userDetails.photo}
//                         width={"40%"}
//                         style={{ borderRadius: "50%" }}
//                     />
//                 </div>
//                 <h3>Welcome {userDetails.firstName}</h3>
//                 <div>
//                     <p>Email: {userDetails.email}</p>
//                     <p>First Name: {userDetails.firstName}</p>
//                     <p>Last Name: {userDetails.lastName}</p>
//                 </div>
//                 <button className="btn btn-primary" onClick={handleLogout}>
//                     Logout
//                 </button>
//             </>
//         ) : (
//             <p>Loading...</p>
//         )}
//     </div>
// );