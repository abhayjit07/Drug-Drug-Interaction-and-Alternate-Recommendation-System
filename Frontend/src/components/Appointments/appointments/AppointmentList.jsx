import { Box, Flex, Text, Tag, IconButton } from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";

export function AppointmentList({ activeTab, upcomingAppointments }) {
    if (activeTab === "Upcoming") {
        return upcomingAppointments.map((appointment) => (
            <Flex
                key={appointment.id}
                p={4}
                borderWidth={1}
                borderRadius="lg"
                justifyContent="space-between"
            >
                <Box>
                    <Text fontSize="xl" fontWeight="bold">{appointment.title}</Text>
                    <Text fontSize="sm" color="gray.500">📅 {appointment.date}</Text>
                    <Text fontSize="sm" color="gray.500">⏰ {appointment.time}</Text>
                    <Text fontSize="sm" color="gray.500">📍 {appointment.location}</Text>
                    <Text fontSize="sm" color="gray.500">{appointment.description}</Text>
                </Box>
                <IconButton icon={<FiMoreVertical />} aria-label="More options" />
            </Flex>
        ));
    }
    if (activeTab === "Completed") {
        return <Text>No completed appointments.</Text>;
    }
    if (activeTab === "Cancelled") {
        return <Text>No cancelled appointments.</Text>;
    }
} 
