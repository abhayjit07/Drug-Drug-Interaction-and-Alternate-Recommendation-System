import { Box, Button, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export default function Reminders() {

    const navigate = useNavigate()
    const reminders = [
        {
            id: 1,
            medicine: "Warfarin",
            time: "9:00 AM",
            quantity: "high",
            startDate: "2 days ago",
            endDate: "2 days later",
        },
        {
            id: 2,
            medicine: "Lisinopril",
            time: "10:00 AM",
            quantity: "medium",
            startDate: "3 days ago",
            endDate: "3 days later",
        },
        {
            id: 3,
            medicine: "Metformin",
            time: "11:00 AM",
            quantity: "low",
            startDate: "5 days ago",
            endDate: "5 days later",
        },
    ]

    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Box p="4" borderBottomWidth="1px">
                <Heading size="md"> Remember to take Medincine </Heading>
                <Text color="gray.600" mt="1">
                    Get Notified when it's time to take your Medicine.
                </Text>
            </Box>
            <Box p="4">
                <VStack spacing="4" align="stretch">
                    {reminders.map((reminder) => (
                        <Flex
                            key={reminder.id}
                            alignItems="center"
                            justifyContent="space-between"
                            p="3"
                            borderWidth="1px"
                            borderRadius="lg"
                        >
                            <Flex alignItems="center" gap="3">
                                <Box>
                                    <Text fontWeight="medium">
                                        {reminder.medicine}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {reminder.time}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {reminder.quantity}
                                    </Text>
                                </Box>
                            </Flex>
                        </Flex>
                    ))}
                </VStack>
            </Box>
            <Box p="4" borderTopWidth="1px">
                <Button variant="outline" width="full" onClick={() => navigate('/medicines')}>
                    View All Medicines
                </Button>
            </Box>
        </Box>
    )
}

