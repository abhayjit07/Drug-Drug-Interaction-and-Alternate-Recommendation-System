// import { Box, Button, Flex, Heading, Text, VStack, Tag, IconButton, useDisclosure } from "@chakra-ui/react";
// import { FiPlus } from "react-icons/fi";
// // import AppointmentsForm from "./appointments/addAppointment";
// import { useState } from "react";
// import { AppointmentList } from "./appointments/AppointmentList";

// export default function Appointments() {
//     const { isOpen, onOpen, onClose } = useDisclosure();
//     const [activeTab, setActiveTab] = useState("Upcoming");

//     const upcomingAppointments = [
//         {
//             id: 1,
//             title: "Doctor Appointment",
//             date: "April 28th, 2025",
//             time: "10:00 AM (30 minutes)",
//             location: "City Medical Center",
//             description: "Annual checkup",
//             category: "Medical"
//         },
//         {
//             id: 2,
//             title: "Dentist Appointment",
//             date: "April 30th, 2025",
//             time: "2:00 PM (1 hour)",
//             location: "Smile Dental Clinic",
//             description: "Regular cleaning",
//             category: "Medical"
//         },
//         {
//             id: 3,
//             title: "Job Interview",
//             date: "May 5th, 2025",
//             time: "11:00 AM (45 minutes)",
//             location: "Tech Solutions Inc.",
//             description: "Bring portfolio and resume",
//             category: "Business"
//         }
//     ];

//     return (
//         <Box>
//             <Flex justifyContent="space-between" p={4}>
//                 <Heading size="lg">Appointments</Heading>
//                 <Button leftIcon={<FiPlus />} colorScheme="blackAlpha" onClick={onOpen}>Add Appointment</Button>
//                 <Button colorScheme="blackAlpha">Calender</Button>
//             </Flex>
//             <Flex p={4} gap={4}>
//                 <Button colorScheme={activeTab === "Upcoming" ? "blue" : "gray"} onClick={() => setActiveTab("Upcoming")}>Upcoming ({upcomingAppointments.length})</Button>
//                 <Button colorScheme={activeTab === "Completed" ? "blue" : "gray"} onClick={() => setActiveTab("Completed")}>Completed (0)</Button>
//                 <Button colorScheme={activeTab === "Cancelled" ? "blue" : "gray"} onClick={() => setActiveTab("Cancelled")}>Cancelled (0)</Button>
//             </Flex>
//             <AppointmentList activeTab={activeTab} upcomingAppointments={upcomingAppointments} />
//             {/* <AppointmentsForm isOpen={isOpen} onClose={onClose} /> */}
//         </Box>
//     );
// }


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 
{ 
  Box, VStack, Heading, Text, Button, 
  useDisclosure, useToast 
} from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Authentication/firebase';  // Import from your firebase.jsx

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  const [user, setUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Get the Firebase ID token
          const token = await currentUser.getIdToken();
          
          // Fetch appointments
          const response = await axios.get('http://localhost:5000/appointments', {
            headers: { 
              'Authorization': `Bearer ${token}` 
            }
          });
          
          setAppointments(response.data);
        } catch (error) {
          toast({
            title: "Error fetching appointments",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true
          });
        }
      } else {
        setUser(null);
        setAppointments([]);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleSubmitAppointment = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please log in first",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      // Get the Firebase ID token
      const token = await user.getIdToken();

      // Send appointment creation request
      await axios.post('http://localhost:5000/appointments', currentAppointment, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      // Refresh appointments (you might want to add this method)
      const response = await axios.get('http://localhost:5000/appointments', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setAppointments(response.data);
      
      // Reset form and close modal
      onClose();
      setCurrentAppointment({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });

      toast({
        title: "Appointment Created",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "Error Creating Appointment",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Render method remains similar to previous example
  return (
    <Box p={5}>
      <VStack spacing={5}>
        <Heading>My Appointments</Heading>
        
        {user && (
          <Button onClick={onOpen} colorScheme="blue">
            Add New Appointment
          </Button>
        )}

        {appointments.map((appointment) => (
          <Box 
            key={appointment.id} 
            borderWidth="1px" 
            borderRadius="lg" 
            p={4} 
            width="100%"
          >
            <Heading size="md">{appointment.title}</Heading>
            <Text>Date: {appointment.date}</Text>
            <Text>Time: {appointment.time}</Text>
            {appointment.location && <Text>Location: {appointment.location}</Text>}
            {appointment.description && <Text>Description: {appointment.description}</Text>}
          </Box>
        ))}

        {/* Modal for adding appointment (similar to previous example) */}
        {/* <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Appointment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input 
                    value={currentAppointment.title}
                    onChange={(e) => setCurrentAppointment({
                      ...currentAppointment, 
                      title: e.target.value
                    })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSubmitAppointment}>
                Save Appointment
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal> */}
      </VStack>
    </Box>
  );
};

export default Appointments;