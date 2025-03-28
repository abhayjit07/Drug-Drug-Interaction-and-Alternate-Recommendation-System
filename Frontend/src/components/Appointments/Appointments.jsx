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
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Authentication/firebase';

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
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'success'
  });

  // Custom toast function
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => {
      setToast({ show: false, message: '', variant: 'success' });
    }, 3000);
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Get the Firebase ID token
          const token = await currentUser.getIdToken();
          
          // Fetch appointments
          const response = await axios.get('http://127.0.0.1:5000/appointments', {
            headers: { 
              'Authorization': `Bearer ${token}` 
            },
            withCredentials: true,
          });
          
          setAppointments(response.data);
        } catch (error) {
          showToast(error.message, 'danger');
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
      showToast('Please log in first', 'danger');
      return;
    }

    try {
      // Get the Firebase ID token
      const token = await user.getIdToken();

      // Send appointment creation request
      console.log(currentAppointment);
      await axios.post('http://127.0.0.1:5000/addappointments', currentAppointment, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      // Refresh appointments
      const response = await axios.get('http://127.0.0.1:5000/appointments', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setAppointments(response.data);
      
      // Reset form and close modal
      setShowModal(false);
      setCurrentAppointment({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });

      showToast('Appointment Created Successfully');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  return (
    <Container className="mt-4">
      {/* Toast Notification */}
      {toast.show && (
        <Alert 
          variant={toast.variant} 
          onClose={() => setToast({ show: false, message: '', variant: 'success' })} 
          dismissible
          className="position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1050 }}
        >
          {toast.message}
        </Alert>
      )}

      <Row>
        <Col>
          <h1 className="mb-4">My Appointments</h1>
          
          {user && (
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)} 
              className="mb-3"
            >
              Add New Appointment
            </Button>
          )}

          {appointments.map((appointment) => (
            <Card key={appointment.id} className="mb-3">
              <Card.Body>
                <Card.Title>{appointment.title}</Card.Title>
                <Card.Text>
                  <strong>Date:</strong> {appointment.date}<br />
                  <strong>Time:</strong> {appointment.time}
                  {appointment.location && (
                    <>
                      <br />
                      <strong>Location:</strong> {appointment.location}
                    </>
                  )}
                  {appointment.description && (
                    <>
                      <br />
                      <strong>Description:</strong> {appointment.description}
                    </>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}

          {/* Modal for adding appointment */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control 
                    type="text"
                    value={currentAppointment.title}
                    onChange={(e) => setCurrentAppointment({
                      ...currentAppointment, 
                      title: e.target.value
                    })}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control 
                    type="date"
                    value={currentAppointment.date}
                    onChange={(e) => setCurrentAppointment({
                      ...currentAppointment, 
                      date: e.target.value
                    })}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control 
                    type="time"
                    value={currentAppointment.time}
                    onChange={(e) => setCurrentAppointment({
                      ...currentAppointment, 
                      time: e.target.value
                    })}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location (Optional)</Form.Label>
                  <Form.Control 
                    type="text"
                    value={currentAppointment.location}
                    onChange={(e) => setCurrentAppointment({
                      ...currentAppointment, 
                      location: e.target.value
                    })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={3}
                    value={currentAppointment.description}
                    onChange={(e) => setCurrentAppointment({
                      ...currentAppointment, 
                      description: e.target.value
                    })}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitAppointment}>
                Save Appointment
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default Appointments;