import { Box, Button, Flex, Heading, Text, VStack, Tag, IconButton, useDisclosure } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
// import AppointmentsForm from "./appointments/addAppointment";
import { useState } from "react";
import { AppointmentList } from "./appointments/AppointmentList";

export default function Appointments() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeTab, setActiveTab] = useState("Upcoming");

    const upcomingAppointments = [
        {
            id: 1,
            title: "Doctor Appointment",
            date: "April 28th, 2025",
            time: "10:00 AM (30 minutes)",
            location: "City Medical Center",
            description: "Annual checkup",
            category: "Medical"
        },
        {
            id: 2,
            title: "Dentist Appointment",
            date: "April 30th, 2025",
            time: "2:00 PM (1 hour)",
            location: "Smile Dental Clinic",
            description: "Regular cleaning",
            category: "Medical"
        },
        {
            id: 3,
            title: "Job Interview",
            date: "May 5th, 2025",
            time: "11:00 AM (45 minutes)",
            location: "Tech Solutions Inc.",
            description: "Bring portfolio and resume",
            category: "Business"
        }
    ];

    return (
        <Box>
            <Flex justifyContent="space-between" p={4}>
                <Heading size="lg">Appointments</Heading>
                <Button leftIcon={<FiPlus />} colorScheme="blackAlpha" onClick={onOpen}>Add Appointment</Button>
            </Flex>
            <Flex p={4} gap={4}>
                <Button colorScheme={activeTab === "Upcoming" ? "blue" : "gray"} onClick={() => setActiveTab("Upcoming")}>Upcoming ({upcomingAppointments.length})</Button>
                <Button colorScheme={activeTab === "Completed" ? "blue" : "gray"} onClick={() => setActiveTab("Completed")}>Completed (0)</Button>
                <Button colorScheme={activeTab === "Cancelled" ? "blue" : "gray"} onClick={() => setActiveTab("Cancelled")}>Cancelled (0)</Button>
            </Flex>
            <AppointmentList activeTab={activeTab} upcomingAppointments={upcomingAppointments} />
            {/* <AppointmentsForm isOpen={isOpen} onClose={onClose} /> */}
        </Box>
    );
}
