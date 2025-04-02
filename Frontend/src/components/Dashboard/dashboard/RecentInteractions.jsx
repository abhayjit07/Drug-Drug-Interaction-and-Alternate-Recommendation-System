import { Box, Button, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react"
import { WarningTwoIcon, CheckCircleIcon, ArrowRightIcon } from "@chakra-ui/icons"
import { useNavigate } from "react-router-dom"

export default function RecentInteractions() {

  const navigate = useNavigate()
  const recentInteractions = [
    {
      id: 1,
      drug1: "Warfarin",
      drug2: "Aspirin",
      severity: "high",
      date: "2 days ago",
    },
    {
      id: 2,
      drug1: "Lisinopril",
      drug2: "Spironolactone",
      severity: "medium",
      date: "3 days ago",
    },
    {
      id: 3,
      drug1: "Metformin",
      drug2: "Glipizide",
      severity: "low",
      date: "5 days ago",
    },
  ]

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Box p="4" borderBottomWidth="1px">
        <Heading size="md">Recent Interactions</Heading>
        <Text color="gray.600" mt="1">
          Your most recent drug interaction checks
        </Text>
      </Box>
      <Box p="4">
        <VStack spacing="4" align="stretch">
          {recentInteractions.map((interaction) => (
            <Flex
              key={interaction.id}
              alignItems="center"
              justifyContent="space-between"
              p="3"
              borderWidth="1px"
              borderRadius="lg"
            >
              <Flex alignItems="center" gap="3">
                {interaction.severity === "high" ? (
                  <Icon as={WarningTwoIcon} boxSize="5" color="red.500" />
                ) : interaction.severity === "medium" ? (
                  <Icon as={WarningTwoIcon} boxSize="5" color="orange.500" />
                ) : (
                  <Icon as={CheckCircleIcon} boxSize="5" color="green.500" />
                )}
                <Box>
                  <Text fontWeight="medium">
                    {interaction.drug1} + {interaction.drug2}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {interaction.date}
                  </Text>
                </Box>
              </Flex>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon />} />
            </Flex>
          ))}
        </VStack>
      </Box>
      <Box p="4" borderTopWidth="1px">
        <Button variant="outline" width="full" onClick={() => navigate('/interactions')}>
          View All Interactions
        </Button>
      </Box>
    </Box>
  )
}

