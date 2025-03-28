// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../Authentication/firebase';
// import DashboardLayout from '../Dashboard/dashboard/DashboardLayout';

// const Appointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [currentAppointment, setCurrentAppointment] = useState({
//     title: '',
//     date: '',
//     time: '',
//     location: '',
//     description: ''
//   });
//   const [user, setUser] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [toast, setToast] = useState({
//     show: false,
//     message: '',
//     variant: 'success'
//   });

//   // Custom toast function
//   const showToast = (message, variant = 'success') => {
//     setToast({ show: true, message, variant });
//     setTimeout(() => {
//       setToast({ show: false, message: '', variant: 'success' });
//     }, 3000);
//   };

//   useEffect(() => {
//     // Listen for authentication state changes
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         try {
//           // Get the Firebase ID token
//           const token = await currentUser.getIdToken();

//           // Fetch appointments
//           const response = await axios.get('http://127.0.0.1:5000/appointments', {
//             headers: {
//               'Authorization': `Bearer ${token}`
//             },
//             withCredentials: true,
//           });

//           setAppointments(response.data);
//         } catch (error) {
//           showToast(error.message, 'danger');
//         }
//       } else {
//         setUser(null);
//         setAppointments([]);
//       }
//     });

//     // Cleanup subscription
//     return () => unsubscribe();
//   }, []);

//   const handleSubmitAppointment = async () => {
//     if (!user) {
//       showToast('Please log in first', 'danger');
//       return;
//     }

//     try {
//       // Get the Firebase ID token
//       const token = await user.getIdToken();

//       // Send appointment creation request
//       console.log(currentAppointment);
//       await axios.post('http://127.0.0.1:5000/addappointments', currentAppointment, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       // Refresh appointments
//       const response = await axios.get('http://127.0.0.1:5000/appointments', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       setAppointments(response.data);
//       // Reset form and close modal
//       setShowModal(false);
//       setCurrentAppointment({
//         title: '',
//         date: '',
//         time: '',
//         location: '',
//         description: ''
//       });

//       showToast('Appointment Created Successfully');
//     } catch (error) {
//       showToast(error.message, 'danger');
//     }
//   };

//   return (
//     <>
//       <DashboardLayout />
//       <Container className="mt-4">
//         {/* Toast Notification */}
//         {toast.show && (
//           <Alert
//             variant={toast.variant}
//             onClose={() => setToast({ show: false, message: '', variant: 'success' })}
//             dismissible
//             className="position-fixed top-0 end-0 m-3"
//             style={{ zIndex: 1050 }}
//           >
//             {toast.message}
//           </Alert>
//         )}

//         <Row>
//           <Col>
//             <h1 className="mb-4">My Appointments</h1>

//             {user && (
//               <Button
//                 variant="primary"
//                 onClick={() => setShowModal(true)}
//                 className="mb-3"
//               >
//                 Add New Appointment
//               </Button>
//             )}

//             {user && (
//               <Button
//                 variant="primary"
//                 onClick={() => setShowModal(true)}
//                 className="mb-3"
//               >
//                 Show in Calender
//               </Button>
//             )}

//             {appointments.map((appointment) => (
//               <Card key={appointment.id} className="mb-3">
//                 <Card.Body>
//                   <Card.Title>{appointment.title}</Card.Title>
//                   <Card.Text>
//                     <strong>Date:</strong> {appointment.date}<br />
//                     <strong>Time:</strong> {appointment.time}
//                     {appointment.location && (
//                       <>
//                         <br />
//                         <strong>Location:</strong> {appointment.location}
//                       </>
//                     )}
//                     {appointment.description && (
//                       <>
//                         <br />
//                         <strong>Description:</strong> {appointment.description}
//                       </>
//                     )}
//                   </Card.Text>
//                 </Card.Body>
//               </Card>
//             ))}

//             {/* Modal for adding appointment */}
//             <Modal show={showModal} onHide={() => setShowModal(false)}>
//               <Modal.Header closeButton>
//                 <Modal.Title>Add New Appointment</Modal.Title>
//               </Modal.Header>
//               <Modal.Body>
//                 <Form>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Title</Form.Label>
//                     <Form.Control
//                       type="text"
//                       value={currentAppointment.title}
//                       onChange={(e) => setCurrentAppointment({
//                         ...currentAppointment,
//                         title: e.target.value
//                       })}
//                       required
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       value={currentAppointment.date}
//                       onChange={(e) => setCurrentAppointment({
//                         ...currentAppointment,
//                         date: e.target.value
//                       })}
//                       required
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Time</Form.Label>
//                     <Form.Control
//                       type="time"
//                       value={currentAppointment.time}
//                       onChange={(e) => setCurrentAppointment({
//                         ...currentAppointment,
//                         time: e.target.value
//                       })}
//                       required
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Location (Optional)</Form.Label>
//                     <Form.Control
//                       type="text"
//                       value={currentAppointment.location}
//                       onChange={(e) => setCurrentAppointment({
//                         ...currentAppointment,
//                         location: e.target.value
//                       })}
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Description (Optional)</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       value={currentAppointment.description}
//                       onChange={(e) => setCurrentAppointment({
//                         ...currentAppointment,
//                         description: e.target.value
//                       })}
//                     />
//                   </Form.Group>
//                 </Form>
//               </Modal.Body>
//               <Modal.Footer>
//                 <Button variant="secondary" onClick={() => setShowModal(false)}>
//                   Cancel
//                 </Button>
//                 <Button variant="primary" onClick={handleSubmitAppointment}>
//                   Save Appointment
//                 </Button>
//               </Modal.Footer>
//             </Modal>
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// };

// export default Appointments;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Nav } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Authentication/firebase';
import DashboardLayout from '../Dashboard/dashboard/DashboardLayout';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
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

  // Filter appointments based on active tab
  useEffect(() => {
    const now = new Date();
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      if (activeTab === 'upcoming') {
        return appointmentDate >= now;
      } else if (activeTab === 'completed') {
        return appointmentDate < now;
      }
      
      return true;
    });

    setFilteredAppointments(filtered);
  }, [activeTab, appointments]);

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
    <>
      <DashboardLayout />
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
              <div className="d-flex justify-content-between mb-3">
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                >
                  Add New Appointment
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(true)}
                >
                  Show in Calendar
                </Button>
              </div>
            )}

            {/* Appointments Tabs */}
            <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
              <Nav.Item>
                <Nav.Link eventKey="upcoming">
                  Upcoming ({appointments.filter(a => new Date(a.date) >= new Date()).length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completed">
                  Completed ({appointments.filter(a => new Date(a.date) < new Date()).length})
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {filteredAppointments.length === 0 ? (
              <p className="mt-3 text-center">No {activeTab} appointments</p>
            ) : (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="mb-3 mt-3">
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
              ))
            )}

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
    </>
  );
};

export default Appointments;