import { Flex, Heading, Button } from "@chakra-ui/react";

export default function DashboardLayout() {
  const handleAlert = () => {
      alert("This is an alert!");
  }

  const handleLogout = () => {
      console.log("Logged out");
  }

  return (
      <Flex as="nav" p="4" bg="blue.500" color="white" justifyContent="space-between" alignItems="center">
          <Heading size="md">My App</Heading>
          <Flex gap="4">
              <Button colorScheme="blue" onClick={() => console.log("Home clicked")}>Home</Button>
              <Button colorScheme="yellow" onClick={handleAlert}>Alert</Button>
              <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
          </Flex>
      </Flex>
  )
}