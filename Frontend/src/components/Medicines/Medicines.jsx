import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav, Card } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { auth } from '../Authentication/firebase';
import DashboardLayout from '../Dashboard/dashboard/DashboardLayout';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { Calendar } from 'react-bootstrap-icons';
import CalendarComponent from './medicines/Calender';


const Medicines = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('medicationList');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [medicationsOnSelectedDate, setMedicationsOnSelectedDate] = useState([]);
    const [medications, setMedications] = useState([]);
    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        medicalCondition: '',
        startDate: '',
        endDate: '',
        notes: ''
    });

    // Toast state and function (similar to Appointments component)
    const [toast, setToast] = useState({
        show: false,
        message: '',
        variant: 'success'
    });

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
        setTimeout(() => {
            setToast({ show: false, message: '', variant: 'success' });
        }, 3000);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const token = await currentUser.getIdToken();
                    const response = await axios.get('http://127.0.0.1:5000/medications', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true,
                    });
                    setMedications(response.data);
                } catch (error) {
                    showToast(error.message, 'danger');
                }
            } else {
                setUser(null);
                setMedications([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Filter medications for selected date
    useEffect(() => {
        if (medications.length > 0) {
            const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
            const filteredMedications = medications.filter(med =>
                (med.startDate <= formattedSelectedDate) &&
                (!med.endDate || med.endDate >= formattedSelectedDate)
            );
            setMedicationsOnSelectedDate(filteredMedications);
        }
    }, [selectedDate, medications]);

    const handleAddMedication = async () => {
        if (!user) {
            showToast('Please log in first', 'danger');
            return;
        }

        try {
            const token = await user.getIdToken();
            await axios.post('http://127.0.0.1:5000/addmedication', newMedication, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Refresh medications list
            const response = await axios.get('http://127.0.0.1:5000/medications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMedications(response.data);

            // Reset form and show success message
            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                medicalCondition: '',
                startDate: '',
                endDate: '',
                notes: ''
            });
            setActiveTab('medicationList');
            showToast('Medication Added Successfully');
        } catch (error) {
            showToast(error.message, 'danger');
        }
    };

    return (
        <>
            <DashboardLayout />
            <Container className="mt-4">
                <h1 className="mb-4">Medication Tracker</h1>

                <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                    <Nav.Item>
                        <Nav.Link eventKey="medicationList">Medication List</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="addMedication">Add Medication</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="calendarView">Calendar View</Nav.Link>
                    </Nav.Item>
                </Nav>

                {activeTab === 'medicationList' && (
                    <div className="mt-3">
                        {medications.length === 0 ? (
                            <p className="text-center">No medications added yet</p>
                        ) : (
                            medications.map((med, index) => (
                                <Card key={index} className="mb-3">
                                    <Card.Body>
                                        <Card.Title>{med.name}</Card.Title>
                                        <Card.Text>
                                            <strong>Dosage:</strong> {med.dosage}<br />
                                            <strong>Frequency:</strong> {med.frequency}<br />
                                            <strong>Medical Condition:</strong> {med.medicalCondition}<br />
                                            <strong>Start Date:</strong> {med.startDate}<br />
                                            {med.endDate && (
                                                <>
                                                    <strong>End Date:</strong> {med.endDate}<br />
                                                </>
                                            )}
                                            {med.notes && (
                                                <>
                                                    <strong>Notes:</strong> {med.notes}
                                                </>
                                            )}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'addMedication' && (
                    <Container className="mt-3">
                        <div className="p-4 border rounded shadow-sm">
                            <Form className="mt-3">
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Medication Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., Amoxicillin"
                                                value={newMedication.name}
                                                onChange={(e) => setNewMedication({
                                                    ...newMedication,
                                                    name: e.target.value
                                                })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Dosage</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., 500mg"
                                                value={newMedication.dosage}
                                                onChange={(e) => setNewMedication({
                                                    ...newMedication,
                                                    dosage: e.target.value
                                                })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Frequency</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., Twice daily"
                                                value={newMedication.frequency}
                                                onChange={(e) => setNewMedication({
                                                    ...newMedication,
                                                    frequency: e.target.value
                                                })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Medical Condition</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., Bacterial Infection"
                                                value={newMedication.medicalCondition}
                                                onChange={(e) => setNewMedication({
                                                    ...newMedication,
                                                    medicalCondition: e.target.value
                                                })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={newMedication.startDate}
                                                onChange={(e) => setNewMedication({
                                                    ...newMedication,
                                                    startDate: e.target.value
                                                })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Date (Optional)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={newMedication.endDate}
                                                onChange={(e) => setNewMedication({
                                                    ...newMedication,
                                                    endDate: e.target.value
                                                })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Notes (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Additional instructions or notes about this medication"
                                        value={newMedication.notes}
                                        onChange={(e) => setNewMedication({
                                            ...newMedication,
                                            notes: e.target.value
                                        })}
                                    />
                                </Form.Group>

                                <Button
                                    variant="dark"
                                    onClick={handleAddMedication}
                                    className="w-100"
                                >
                                    Add Medication
                                </Button>
                            </Form>
                        </div>
                    </Container>
                )}

                {activeTab === 'calendarView' && (
                 <CalendarComponent
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  medications={medicationsOnSelectedDate}
                   />
                )}
            </Container>
        </>
    );
};

export default Medicines;