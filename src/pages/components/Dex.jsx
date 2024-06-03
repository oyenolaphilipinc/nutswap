import React from "react";
import {
  Flex,
  Box,
  Text,
  Image,
  Icon,
  useBreakpointValue,
  Input,
  HStack,
  Spacer,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import bg from "../../../public/bg.png";
import { TonConnectButton } from "@tonconnect/ui-react";
import { LuRefreshCw } from "react-icons/lu";
import { GiSettingsKnobs } from "react-icons/gi";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";

const Dex = () => {
  return (
    <Flex
      direction="column"
      minH="100vh"
      backgroundImage={`url(${bg.src})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      bgColor="#0D0904"
     
    >
      <Flex justify="space-between" align="center" p="4">
        <Box maxW="200px" maxH="50px">
          <Image
            src="/logo.png"
            alt="Logo"
            objectFit="contain"
            width="100%"
            height="100%"
          />
        </Box>
        <Box
          as="div"
          className="ton-connect-button"
          sx={{
            display: "inline-block",
            borderRadius: "10px",
            border: "1px solid #FFFF6C",
            background: "",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s",
            "&:hover": {
              backgroundColor: "#0D0904",
              border: "2px solid white",
            },
            "& .ton-connect-button__icon": {
              marginRight: "8px",
            },
          }}
        >
          <TonConnectButton />
        </Box>
      </Flex>

      <Flex direction="column" justify="center" align="center" minH="100vh" gap={5} >
        <Flex
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          justify={"end"}
          gap={5}
          p={3}
          
        >
          <Icon as={LuRefreshCw} boxSize={6} color={"#FFFF6C"} />
          <Icon as={GiSettingsKnobs} boxSize={6} color={"#FFFF6C"} />
        </Flex>
        <Flex
          // justify="center"
          minH="75vh"
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          borderRadius="15px"
          border="2px solid #FFFF6C"
          direction={"column"}
          gap={1}
        >
          <Flex direction={"column"} w={"100%"} p={5} gap={2}>
            <Flex gap={2} color={"white"} alignItems={"center"}>
              <Image src="/logoton.png" />
              <Text fontSize={"x-large"}>TON</Text>
              <Icon as={TriangleDownIcon} boxSize={3} />
            </Flex>

            <Input
              h={"10vh"}
              borderRadius={"10px"}
              bg={"#3B3626"}
              border={"none"}
            />
          </Flex>

          <Flex
            bg="#3B3626"
            borderRadius="50%"
            p={2}
            w={useColorModeValue({base: '6vw', medium: '6vw', lg: "3vw"})}
            h={useColorModeValue({base: '12vh', medium: '12vh', lg:"6vh"})}
            justify="center"
            align="center"
            alignSelf={"center"}
          >
            <Icon
              as={MdOutlineKeyboardDoubleArrowDown}
              boxSize={6}
              color={"#FFFF6C"}
            />
          </Flex>

          <Flex direction={"column"} w={"100%"} p={5} gap={2}>
            <Flex gap={2} color={"white"} alignItems={"center"}>
              <Image src="/nut.png" />
              <Text fontSize={"x-large"}>NUT</Text>
              <Icon as={TriangleDownIcon} boxSize={3} />
            </Flex>

            <Input
              h={"10vh"}
              borderRadius={"10px"}
              bg={"#3B3626"}
              border={"none"}
            />
          </Flex>

          <Flex
            w={useBreakpointValue({ base: "93%", medium: "93%", lg: "27vw" })}
            alignSelf={"center"}
            borderRadius="10px"
            border="1px solid #FFFF6C"
            mb={3}
            direction={"column"}
            h={useColorModeValue({base: '20vh', medium: '20vh', lg:"25vh"})}
          >
            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#9D9463"
                color="#9D9463"
              >
                Rate
              </Text>
              <Spacer />
              <Text color={"white"}>1 TON = 15.678.68 NUT </Text>
            </HStack>

            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#9D9463"
                color="#9D9463"
              >
                Minimum Received
              </Text>
              <Spacer />
              <Text color={"white"}> 15,0101.52 NUT</Text>
            </HStack>

            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#9D9463"
                color="#9D9463"
              >
                Price Impact
              </Text>
              <Spacer />
              <Text color={"white"}>  {`<0.05% `}</Text>
            </HStack>

            <HStack p={2}>
              <Text
                textDecoration="underline"
                textDecorationStyle="dotted"
                textDecorationColor="#9D9463"
                color="#9D9463"
              >
                Tx Fee
              </Text>
              <Spacer />
              <Text color={"white"}> 0.2 - 0.05</Text>
            </HStack>
          </Flex>

          <Button alignSelf={'center'} w={useBreakpointValue({ base: "80%", medium: "80%", lg: "27vw" })}
           mb={4} bgColor={'#FFFF6C'} h={'8vh'} borderRadius={'10px'} _hover={{ bg: "#FFFF6C", opacity: 0.8 }}
           >CONNECT WALLET</Button>
        </Flex>

        <Flex
        w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          borderRadius="15px"
          border="2px solid #FFFF6C"
          justifyContent={'space-between'}
          h={"15vh"} p={2}>
              <Flex gap={2} color={"white"} alignItems={"center"}>
              <Image src="/logoton.png" />
              <Text fontSize={"x-large"}>TON</Text>
              <Icon as={TriangleUpIcon} boxSize={3} color={'green.400'} />
            </Flex>

            <Flex gap={2} alignItems={'center'}>
              <Text fontSize={'x-small'} color={'#9D9463'}>Price</Text>
              <Text fontSize={'larger'} color={'white'}>$6.5</Text>
            </Flex>
        </Flex>

        <HStack mb={7}>
          <Text color={'#9D9463'}>Built with precision by </Text>
          <Image src={'/Footer.png'} />
        </HStack>
      </Flex>
    </Flex>
  );
};

export default Dex;
