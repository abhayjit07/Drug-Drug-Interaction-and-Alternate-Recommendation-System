import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"

export default function Appointments() {
    const upcomingAppointments = [
        {
            id: 1,
            doctor: "Dr. John Doe",
            date: "23rd May",
            time: "2:00 PM",
            location: "123 Main St, New York, NY",
        },
        {
            id: 2,
            doctor: "Dr. Jane Smith",
            date: "25th May",
            time: "10:00 AM",
            location: "456 Elm St, New York, NY",
        },
        {
            id: 3,
            doctor: "Dr. Michael Johnson",
            date: "27th May",
            time: "3:00 PM",
            location: "789 Oak St, New York, NY",
        },
    ]

    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Box p="4" borderBottomWidth="1px">
                <Heading size="md">Upcoming Appointments</Heading>
                <Text color="gray.600" mt="1">Stay on top of your schedule</Text>
            </Box>
            <Box p="4">
                <VStack spacing="4" align="stretch">
                    {upcomingAppointments.map((appointment) => (
                        <Flex
                            key={appointment.id}
                            alignItems="center"
                            justifyContent="space-between"
                            p="3"
                            borderWidth="1px"
                            borderRadius="lg"
                        >
                            <Box>
                                <Text fontWeight="medium">{appointment.doctor}</Text>
                                <Text fontSize="sm" color="gray.500">{appointment.date} at {appointment.time}</Text>
                                <Text fontSize="sm" color="gray.500">{appointment.location}</Text>
                            </Box>
                        </Flex>
                    ))}
                </VStack>
            </Box>
            <Box p="4" borderTopWidth="1px">
                <Button variant="outline" width="full">View All Appointments</Button>
            </Box>
        </Box>
    )
}
