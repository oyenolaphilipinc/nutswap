import React from "react";
import {
  Flex,
  Box,
  Text,
  Image,
  Icon,
  useBreakpointValue,
  InputGroup,
  Input,
  InputLeftElement,
  HStack,
  Spacer,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Drawer,
  Divider,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { DeDustClient, JettonWallet, VaultJetton } from "@dedust/sdk";
import { toast } from "react-toastify";
import bg from "../../../public/bg.png";
import { TonConnectButton } from "@tonconnect/ui-react";
import { LuRefreshCw } from "react-icons/lu";
import { GiSettingsKnobs } from "react-icons/gi";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { useState, useEffect } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Address,
  toNano,
  Sender,
  fromNano,
  TonClient,
  beginCell,
} from "@ton/ton";
import {
  Asset,
  Factory,
  JettonRoot,
  MAINNET_FACTORY_ADDR,
  Pool,
  PoolType,
  VaultNative,
} from "@dedust/sdk";
import { useTonConnect } from "@/Hooks/useTonConnect";
import { useTonClient } from "@/Hooks/useTonClient";
import { TonClient4 } from "@ton/ton";
import axios from "axios";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useSwapAggregator } from "@/Hooks/useSwapAggregator";
import { useSwapRoot } from "@/Hooks/useSwapRoot";
import { useRouter } from "next/router";
import Tonweb from "tonweb";

const Dex = ({ coins }) => {
  const [amount, setAmount] = useState("");
  const [change, setChange] = useState("");
  const [buttonText, setButtonText] = useState("Enter an amount");
  const [buttonColor, setButtonColor] = useState("bg-gray-200 text-gray-600");
  const [selectedToken, setSelectedToken] = useState({
    contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    imageUrl: "https://assets.dedust.io/images/ton.webp",
    name: "Toncoin",
    symbol: "TON",
  }); // State to store the selected token
  const [selectedCoin, setSelectedCoin] = useState({
    contractAddress: "EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE",
    imageUrl: "https://assets.dedust.io/images/scale.webp",
    name: "Scaleton",
    symbol: "SCALE",
  });
  const [filteredCoins, setFilteredCoins] = useState(coins); // State to store filtered coins
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSecondModalOpen,
    onOpen: onSecondModalOpen,
    onClose: onSecondModalClose,
  } = useDisclosure();

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const { sender, userAddress, connected } = useTonConnect();
  const client = useTonClient();
  const [tonBalance, setTonBalance] = useState(0);
  const [amountOut, setAmountOut] = useState(0);
  const [amountInUSD, setAmountInUSD] = useState(0);
  const [fromTokenPrice, setFromTokenPrice] = useState(0); // State variable for fromTokenPrice
  const [toTokenPrice, setToTokenPrice] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  const [priceAmount, setPriceAmount] = useState(0);
  const [tonPrice, setTonPrice] = useState(0);
  const [referralId, setReferralId] = useState("");
  const [jtBalance, setJtBalance] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const params = router.query;
    if (params) {
      console.log("params", params.refId);
      setReferralId(params.refId);
    }
  }, []);

  const {
    noReferred,
    referralEarnings,
    userAggregatorStatus,
    swapTonForJetton,
    swapJettonForTon,
    swapJettonForJetton,
    withdrawJetton,
  } = useSwapAggregator();
  const { fixedFee, initSwapAggregator } = useSwapRoot();

  //   const fetch = async ()=>{
  //   const tonweb = new Tonweb();
  // const walletAddress = "EQBYc3DSi36qur7-DLDYd-AmRRb4-zk6VkzX0etv5Pa-Bq4Y";
  // const jettonWallet = await tonweb.provider.

  // console.log('Jetton balance:', jettonWallet);
  //   }

  //   fetch()

  const [isLoading, setIsLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const withdraw = async () => {
    setWithdrawing(true);
    await withdrawJetton();
    setWithdrawing(false);
  };

  useEffect(() => {
    // Initialize filtered coins with all coins initially
    setFilteredCoins(coins);
  }, [coins]);

  useEffect(() => {
    const tonPrice = async () => {
      const tonPrice = await fetchTonPrice();
      console.log(tonPrice?.usd);
      setTonPrice(tonPrice?.usd);
    };

    tonPrice();
  }, []);

  const fetchBalance = async () => {
    try {
      if (client && connected) {
        const wallet = await client.getLastBlock();
        const seqno = wallet.last.seqno;
        const balance = await client.getAccount(seqno, userAddress);
        const tonBalance = parseFloat(fromNano(balance.account.balance.coins));
        console.log(tonBalance.toFixed(4));
        setTonBalance(tonBalance.toFixed(4));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchJettonBalance = async (jettonRootAddress) => {
    try {
      if (client && connected) {
        const jettonRoot = client.open(
          JettonRoot.createFromAddress(Address.parse(jettonRootAddress))
        );
        const jettonWallet = client.open(
          await jettonRoot.getWallet(Address.parse(userAddress))
        );
        const jettonBalance = await jettonWallet.getBalance();
        setJtBalance(Number(fromNano(jettonBalance)).toFixed(4));
      }
    } catch (err) {
      console.log("Error fetching jetton balance", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await fetchBalance();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [client, connected, userAddress]); // Add dependencies here

  useEffect(() => {
    fetchJettonBalance(selectedCoin.contractAddress);
  }, [client, connected, userAddress, selectedCoin, selectedToken]);

  useEffect(() => {
    if (selectedToken && selectedCoin && amount) {
      fetchEquivalentAmount(
        selectedToken.contractAddress,
        selectedCoin.contractAddress,
        amount
      );
    }
  }, [selectedToken, selectedCoin, amount]);

  const fetchTonPrice = async () => {
    const apiKey = "CG-HVh6stdWnBt3jz9oHydUvJMa"; // Replace with your actual API key

    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: "the-open-network",
            vs_currencies: "usd",
          },
          headers: {
            "Content-Type": "application/json",
            "x-cg-demo-api-key": apiKey,
          },
        }
      );

      return response.data["the-open-network"];
    } catch (error) {
      console.error("Error fetching TON price:", error);
      return null; // Return null or some default value in case of error
    }
  };

  const fetchTokenDetails = async (contractAddress) => {
    try {
      const response = await axios.get(
        `https://api.dexscreener.io/latest/dex/tokens/${contractAddress}`
      );
      console.log(response.data);

      return response.data.pairs[0];
    } catch (error) {
      console.error("Error fetching token details:", error);
      return null;
    }
  };
  const fetchEquivalentAmount = async (fromAddress, toAddress, amount) => {
    console.log("toaddress", toAddress);
    if (Number(amount) <= 0) return;
    try {
      let fromTokenData;
      let toTokenData;

      if (selectedToken.symbol === "TON") {
        fromTokenData = await fetchTonPrice();
        toTokenData = await fetchTokenDetails(toAddress);

        console.log("fromTokenData:", fromTokenData);
        console.log("toTokenData:", toTokenData);

        if (fromTokenData && toTokenData) {
          const fromTokenPrice = parseFloat(fromTokenData.usd);
          const toTokenPrice = parseFloat(toTokenData.priceUsd);

          console.log("fromTokenPrice:", fromTokenPrice);
          console.log("toTokenPrice:", toTokenPrice);
          const amountInUSD = amount * fromTokenPrice;
          setAmountInUSD(amountInUSD);

          if (toTokenPrice !== 0) {
            const equivalentAmount = (amount * fromTokenPrice) / toTokenPrice;
            const expectedAmountOut = await getExpectedSwapAmount(
              toAddress,
              amount
            );
            console.log(
              "Expected amount out considering price impact:",
              expectedAmountOut
            );
            console.log("Equivalent amount:", equivalentAmount);
            const priceImpactPercentage =
              ((equivalentAmount - expectedAmountOut) / equivalentAmount) * 100;
            console.log(
              "Price Impact Percentage:",
              priceImpactPercentage.toFixed(2) + "%"
            );
            const priceAMount = expectedAmountOut * toTokenPrice;

            console.log("real", amountInUSD);
            setPriceAmount(priceAMount);

            setAmountOut(expectedAmountOut);
            setPriceImpact(priceImpactPercentage);
            setFromTokenPrice(fromTokenPrice);
            setToTokenPrice(toTokenPrice);
          } else {
            console.error("Error: Division by zero (toTokenPrice is 0)");
          }
        }
      } else if (selectedCoin.symbol === "TON") {
        fromTokenData = await fetchTokenDetails(fromAddress);
        toTokenData = await fetchTonPrice();

        console.log("fromTokenData:", fromTokenData);
        console.log("toTokenData:", toTokenData);

        if (fromTokenData && toTokenData) {
          const fromTokenPrice = parseFloat(fromTokenData.priceUsd);
          const toTokenPrice = parseFloat(toTokenData.usd);

          console.log("fromTokenPrice:", fromTokenPrice);
          console.log("toTokenPrice:", toTokenPrice);

          if (toTokenPrice !== 0) {
            const equivalentAmount = (amount * fromTokenPrice) / toTokenPrice;
            const expectedAmountOut = await getExpectedSwapAmount(
              fromAddress,
              amount
            );

            console.log("Equivalent amount:", equivalentAmount);
            console.log("expected amount out");

            const priceAMount = equivalentAmount * fromTokenPrice;

            const amountInUSD = amount * fromTokenPrice;
            console.log("real", amountInUSD);
            console.log("real", amountInUSD);
            setPriceAmount(priceAMount);
            setAmountOut(expectedAmountOut);
            setAmountInUSD(amountInUSD);
            setFromTokenPrice(fromTokenPrice);
            setToTokenPrice(toTokenPrice);
          } else {
            console.error("Error: Division by zero (toTokenPrice is 0)");
          }
        }
      } else {
        fromTokenData = await fetchTokenDetails(fromAddress);
        toTokenData = await fetchTokenDetails(toAddress);

        console.log("fromTokenData:", fromTokenData);
        console.log("toTokenData:", toTokenData);

        if (fromTokenData && toTokenData) {
          const fromTokenPrice = parseFloat(fromTokenData.priceUsd);
          const toTokenPrice = parseFloat(toTokenData.priceUsd);

          console.log("fromTokenPrice:", fromTokenPrice);
          console.log("toTokenPrice:", toTokenPrice);

          if (toTokenPrice !== 0) {
            const equivalentAmount = (amount * fromTokenPrice) / toTokenPrice;
            console.log("Equivalent amount:", equivalentAmount);
            const amountInUSD = amount * fromTokenPrice;

            setAmountOut(equivalentAmount.toFixed(5));
            setAmountInUSD(amountInUSD);
            setFromTokenPrice(fromTokenPrice);
            setToTokenPrice(toTokenPrice);
          } else {
            console.error("Error: Division by zero (toTokenPrice is 0)");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching equivalent amount:", error);
    }
  };

  const getExpectedSwapAmount = async (address, amount) => {
    const client = new TonClient4({
      endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    const factory = client.open(
      Factory.createFromAddress(MAINNET_FACTORY_ADDR)
    );

    const contractAddress = Address.parse(address);
    const jetton = client.open(JettonRoot.createFromAddress(contractAddress));

    const pool = client.open(
      Pool.createFromAddress(
        await factory.getPoolAddress({
          poolType: PoolType.VOLATILE,
          assets: [Asset.native(), Asset.jetton(jetton.address)],
        })
      )
    );

    const lastBlock = await client.getLastBlock();
    const poolState = await client.getAccountLite(
      lastBlock.last.seqno,
      pool.address
    );

    if (poolState.account.state.type !== "active") {
      throw new Error("Pool does not exist.");
    }

    const amountIn = toNano(amount);

    let expectedAmountOut;

    if (selectedToken.symbol === "TON") {
      expectedAmountOut = await pool.getEstimatedSwapOut({
        assetIn: Asset.native(),
        amountIn,
      });
      console.log(fromNano(expectedAmountOut.amountOut));
    } else {
      expectedAmountOut = await pool.getEstimatedSwapOut({
        assetIn: Asset.jetton(jetton.address),
        amountIn,
      });
    }

    // Slippage handling (1%)
    const minAmountOut =
      (expectedAmountOut.amountOut * BigInt(99)) / BigInt(100); // expectedAmountOut - 1%
    console.log("Min amount out after slippage:", fromNano(minAmountOut));

    return fromNano(minAmountOut);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setButtonText("Connect Wallet Address");
    setButtonColor("bg-[#0680fb] text-white");
  };

  // Function to filter coins based on search query
  const fetchTokenDetailsFromTon = async (contractAddress) => {
    console.log("fetching ton details");
    const options = {
      method: "GET",
      headers: { accept: "application/json" },
      url: `https://toncenter.com/api/v2/getTokenData?address=${contractAddress}`,
    };

    try {
      const response = await axios(options);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching token details:", error);
      throw error;
    }
  };

  const fetchAdditionalContent = async (url) => {
    if (!url) {
      throw new Error("Invalid URL");
    }

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching additional content:", error);
      throw error;
    }
  };

  const isTonContractAddress = (address) => {
    // Assuming TON contract addresses start with "EQ" and are 48 characters long
    const tonAddressPattern = /^EQ[A-Za-z0-9_-]/;
    return tonAddressPattern.test(address);
  };

  const handleSearch = async (query) => {
    if (isTonContractAddress(query)) {
      // Fetch coin details using the contract address
      try {
        const coinDetails = await fetchTokenDetailsFromTon(query);
        console.log("Coin Details:", coinDetails);

        if (coinDetails.result && coinDetails.result.jetton_content) {
          const jettonContent = coinDetails.result.jetton_content;

          if (jettonContent.type === "onchain") {
            // Use the on-chain data directly
            const onChainData = jettonContent.data;
            console.log("On-chain Data:", onChainData);
            const combinedDetails = {
              name: onChainData.name,
              symbol: onChainData.symbol,
              imageUrl: onChainData.image,
              contractAddress: query,
            };

            setFilteredCoins([combinedDetails]);
          } else if (jettonContent.type === "offchain") {
            // Fetch the off-chain data from the URI
            let offChainUri;
            if (
              jettonContent.data ===
              "https://github.com/dogeployer/jettons/raw/main/json/53_20240419180844.json"
            ) {
              offChainUri =
                "https://raw.githubusercontent.com/dogeployer/jettons/main/json/53_20240419180844.json";
              console.log("Off-chain URI:", offChainUri);
            } else {
              offChainUri = jettonContent.data;
              console.log("Off-chain URI:", offChainUri);
            }

            if (offChainUri) {
              const additionalContent = await fetchAdditionalContent(
                offChainUri
              );
              console.log("Off-chain Data:", additionalContent);
              const combinedDetails = {
                name: additionalContent.name,
                symbol: additionalContent.symbol,
                imageUrl: additionalContent.image,
                contractAddress: query,
              };
              setFilteredCoins([combinedDetails]);
            } else {
              console.error("Off-chain URI is undefined");
              setFilteredCoins([coinDetails]);
            }
          }
        } else {
          setFilteredCoins([coinDetails]);
        }
      } catch (error) {
        console.error("Error fetching coin details:", error);
        setFilteredCoins([]); // Clear the list or show a message indicating the coin wasn't found
      }
    } else {
      // Filter coins by name or symbol
      const filtered = coins.filter((coin) => {
        return (
          coin.name.toLowerCase().includes(query.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(query.toLowerCase())
        );
      });
      setFilteredCoins(filtered);
    }
  };

  // Function to handle selection of a token
  const handleTokenSelection = (token) => {
    setSelectedToken(token);
    setFilteredCoins(coins);
    onClose(); // Close the modal
  };

  const handleCoinSelection = (token) => {
    setSelectedCoin(token);
    setFilteredCoins(coins);
    onSecondModalClose(); // Close the modal
  };

  const handleSwap = async () => {
    if (!connected) {
      toast.error("Please connect wallet");
      return;
    }
    if (Number(amount) <= 0) return;
    setIsLoading(true);
    const tonData = await fetchTonPrice();
    let toAmount;
    if (fromTokenPrice) {
      const tokenInTon = toNano(
        (Number(amount) * fromTokenPrice) / parseFloat(tonData.usd)
      );
      toAmount =
        Number(fixedFee) > Number(tokenInTon) * 0.01 ? fixedFee : tokenInTon;
    } else {
      toAmount = fixedFee || toNano("0.01");
    }
    try {
      if (selectedToken.symbol === "TON") {
        await swapTonForJetton(selectedCoin.contractAddress, toNano(amount));
      } else if (selectedCoin.symbol === "TON") {
        await swapJettonForTon(
          selectedToken.contractAddress,
          toNano(amount),
          toAmount
        );
      } else if (
        selectedCoin.symbol != "TON" &&
        selectedToken.symbol != "TON"
      ) {
        await swapJettonForJetton(
          selectedToken.contractAddress,
          selectedCoin.contractAddress,
          toNano(amount),
          toAmount
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  const [tonConnectUI] = useTonConnectUI();

  return (
    <Flex
      direction="column"
      minH="100vh"
      backgroundImage={`url(${bg.src})`}
      backgroundSize="contain"
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

      <Flex
        direction="column"
        justify="center"
        align="center"
        minH="100vh"
        gap={5}
      >
        <Flex
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          justify={"end"}
          gap={5}
          p={3}
        >
          <Icon as={LuRefreshCw} boxSize={6} color={"#FFFF6C"} />
          <Icon
            onClick={onDrawerOpen}
            cursor={"pointer"}
            as={GiSettingsKnobs}
            boxSize={6}
            color={"#FFFF6C"}
          />
        </Flex>
        <Flex
          // justify="center"
          minH="75vh"
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          borderRadius="15px"
          border="2px solid #FFFF6C"
          direction={"column"}
          gap={1}
          bg={"#D9D9D91A"}
        >
          <Flex direction={"column"} w={"100%"} p={5} gap={2}>
            <Flex justifyContent={"space-between"}>
              <Flex
                gap={2}
                color={"white"}
                alignItems={"center"}
                cursor={"pointer"}
                onClick={onOpen}
              >
                <img
                  src={selectedToken ? selectedToken.imageUrl : "/logoton.png"}
                  width={40}
                  height={40}
                />
                <Text fontSize={"x-large"}>
                  {selectedToken ? selectedToken.symbol : "TON"}
                </Text>
                <Icon as={TriangleDownIcon} boxSize={3} />
              </Flex>

              <Text color={"white"}>
                {tonBalance && tonBalance !== null ? tonBalance : "0.00"}
              </Text>
            </Flex>

            <Input
              h={"10vh"}
              borderRadius={"10px"}
              bg={"#3B3626"}
              border={"none"}
              type="number"
              color={"white"}
              value={amount}
              onChange={handleAmountChange}
              textAlign={"right"}
            />
          </Flex>

          <Flex
            bg="#3B3626"
            borderRadius="50%"
            p={2}
            w={useColorModeValue({ base: "6vw", medium: "6vw", lg: "3vw" })}
            h={useColorModeValue({ base: "12vh", medium: "12vh", lg: "6vh" })}
            justify="center"
            align="center"
            alignSelf={"center"}
            textAlign={"right"}
          >
            <Icon
              as={MdOutlineKeyboardDoubleArrowDown}
              boxSize={6}
              color={"#FFFF6C"}
            />
          </Flex>

          <Flex direction={"column"} w={"100%"} p={5} gap={2}>
          <Flex justifyContent={'space-between'}>
            <Flex
              gap={2}
              color={"white"}
              alignItems={"center"}
              cursor={"pointer"}
              onClick={onSecondModalOpen}
            >
              <img
                src={selectedCoin ? selectedCoin.imageUrl : "/nut.png"}
                width={40}
                height={40}
              />
              <Text fontSize={"x-large"}>
                {selectedCoin ? selectedCoin.symbol : "NUT"}
              </Text>
              <Icon as={TriangleDownIcon} boxSize={3} />
            </Flex>
            <Text color={"white"}>{jtBalance}</Text>
            </Flex>

            <Input
              h={"10vh"}
              borderRadius={"10px"}
              bg={"#3B3626"}
              border={"none"}
              type="number"
              color={"white"}
              value={amountOut}
              placeholder={Number(0)}
              readOnly
            />
            
          </Flex>

          <Flex
            w={useBreakpointValue({ base: "93%", medium: "93%", lg: "27vw" })}
            alignSelf={"center"}
            borderRadius="10px"
            border="1px solid #FFFF6C"
            mb={3}
            direction={"column"}
            h={useColorModeValue({ base: "20vh", medium: "20vh", lg: "25vh" })}
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
              <Text color={"white"}>
                {selectedToken ? `1 ${selectedToken.symbol}` : null} ={" "}
                {fromTokenPrice &&
                  toTokenPrice &&
                  (fromTokenPrice / toTokenPrice).toFixed(4)}{" "}
                {selectedCoin && selectedCoin.symbol}{" "}
              </Text>
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
              <Text color={"white"}>
                {" "}
                {selectedCoin && `${amountOut} ${selectedCoin.symbol}`}
              </Text>
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
              <Text color={"white"}> {`<${priceImpact.toFixed(2)}% `}</Text>
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
          <Button
            alignSelf={"center"}
            w={useBreakpointValue({ base: "80%", medium: "80%", lg: "27vw" })}
            mb={4}
            bgColor={"#FFFF6C"}
            h={"8vh"}
            borderRadius={"10px"}
            _hover={{ bg: "#FFFF6C", opacity: 0.8 }}
            onClick={userAggregatorStatus ? handleSwap : initSwapAggregator}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : userAggregatorStatus
              ? "SWAP"
              : "Initialize"}
          </Button>

          {/* <Button
            alignSelf={"center"}
            w={useBreakpointValue({ base: "80%", medium: "80%", lg: "27vw" })}
            mb={4}
            bgColor={"#FFFF6C"}
            h={"8vh"}
            borderRadius={"10px"}
            _hover={{ bg: "#FFFF6C", opacity: 0.8 }}
            onClick={withdrawJetton}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Withdraw Jettons"}
          </Button> */}
        </Flex>

        <Flex
          w={useBreakpointValue({ base: "85%", medium: "85%", lg: "30vw" })}
          borderRadius="15px"
          border="2px solid #FFFF6C"
          justifyContent={"space-between"}
          h={"15vh"}
          p={2}
        >
          <Flex gap={2} color={"white"} alignItems={"center"}>
            <Image src="/logoton.png" />
            <Text fontSize={"x-large"}>TON</Text>
            <Icon as={TriangleUpIcon} boxSize={3} color={"green.400"} />
          </Flex>

          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"x-small"} color={"#9D9463"}>
              Price
            </Text>
            <Text fontSize={"larger"} color={"white"}>
              {tonPrice && `$ ${tonPrice}`}
            </Text>
          </Flex>
        </Flex>

        <HStack mb={7}>
          <Text color={"#9D9463"}>Built with precision by </Text>
          <Image src={"/Footer.png"} />
        </HStack>
      </Flex>

      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          backgroundImage={`url(${bg.src})`}
          backgroundSize="contain"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          bgColor="#0D0904"
          color={"white"}
        >
          <ModalHeader>Select token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Box>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    border="2px solid #FFFF6C"
                    placeholder="Search assets or address"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Tabs>
                <TabList>
                  <Tab>Assets</Tab>
                  <Tab>Favourite</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Flex direction={"column"} gap={5}>
                      {filteredCoins &&
                        filteredCoins.map((coin, index) => {
                          return (
                            <Flex
                              key={index}
                              gap={4}
                              alignItems={"center"}
                              onClick={() => handleTokenSelection(coin)}
                            >
                              <Box>
                                <Image src={coin.imageUrl} w={10} />
                              </Box>

                              <Flex direction={"column"}>
                                <Text fontWeight={"bolder"}>{coin.symbol}</Text>
                                <Text>{coin.name}</Text>
                              </Flex>
                            </Flex>
                          );
                        })}
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isCentered
        onClose={onSecondModalClose}
        isOpen={isSecondModalOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          backgroundImage={`url(${bg.src})`}
          backgroundSize="contain"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          bgColor="#0D0904"
          color={"white"}
        >
          <ModalHeader>Select token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Box>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    placeholder="Search assets or address"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Tabs>
                <TabList>
                  <Tab>Assets</Tab>
                  <Tab>Favourite</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Flex direction={"column"} gap={5}>
                      {filteredCoins &&
                        filteredCoins.map((coin, index) => {
                          return (
                            <Flex
                              key={index}
                              gap={4}
                              alignItems={"center"}
                              onClick={() => handleCoinSelection(coin)}
                            >
                              <Box>
                                <Image src={coin.imageUrl} w={10} />
                              </Box>

                              <Flex direction={"column"}>
                                <Text fontWeight={"bolder"}>{coin.symbol}</Text>
                                <Text>{coin.name}</Text>
                              </Flex>
                            </Flex>
                          );
                        })}
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onSecondModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Drawer
        placement={"bottom"}
        onClose={onDrawerClose}
        isOpen={isDrawerOpen}
      >
        <DrawerOverlay />
        <DrawerContent minH={'50vh'} bgColor="#0D0904"  >
          <DrawerBody  bgColor="#0D0904" borderTopRadius={'24px'} border="4px solid #FFFF6C">
            <Flex direction={'column'} w={'100%'} gap={5} >
              <Heading textAlign={'center'} fontSize={'4xl'} color={'white'} mt={4}>Advanced Settings</Heading>
              <Flex direction={'column'} gap={2}> 
                <Heading color={'white'} fontSize={'2xl'} fontWeight={"normal"} > Slippage</Heading>
                <Text color={'yellow.100'}>Your transactions will revert if the price changes unfavourably by more than this percentage</Text>
              </Flex>
              <Flex direction={'column'}>
                <Flex justifyContent={'space-between'}> 
                  <Text textAlign={'center'} h={'5vh'} py={2} border={'2px solid #FFFF6C'} borderRadius={'10px'} w={'25vw'} color={'white'}>
                    1%
                  </Text>
                  <Text textAlign={'center'} border={'2px solid #FFFF6C'} w={'25vw'} color={'white'} py={2} borderRadius={"10px"}>
                    5%
                  </Text>
                  <Text textAlign={'center'} border={'2px solid #FFFF6C'} w={'25vw'} color={'white'} py={2} borderRadius={"10px"}>
                    10%
                  </Text>
                </Flex>
                <Text textAlign={"center"} color={"yellow.200"} mt={4} mb={4} border={"2px solid #ffff6c"} py={3} borderRadius={"10px"} fontSize={"2xl"}>49%</Text>
                <Divider borderColor={"#1f1910"} borderWidth={"2px"} my={4} />
                <Button mx={"auto"} w={"75vw"} mt={4} bgColor={"#868438"} py={7} color={"white"} fontSize={"xl"} mb={6}>SAVE</Button>
              </Flex>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Dex;
