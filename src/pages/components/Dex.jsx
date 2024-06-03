import React from 'react'
import {
Flex,
Box,
Text,
Image
} from '@chakra-ui/react'
import bg from '../../../public/bg.png'
import { TonConnectButton } from '@tonconnect/ui-react'

const Dex = () => {
  return (
   <Flex 
      direction={'column'}
      minH={'100vh'}
      backgroundImage={`url(${bg.src})`}
      backgroundSize={'cover'}
      backgroundPosition={'center'}
      backgroundRepeat={'no-repeat'}
      bgColor={"#0D0904"}
    >

      <Flex>
        <Box>
          <Image src='logo.png' />
        </Box>

        <TonConnectButton />
      </Flex>
    </Flex>
  )
}

export default Dex