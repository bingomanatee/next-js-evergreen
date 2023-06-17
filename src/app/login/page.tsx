"use client"
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Box, Button, Flex, Heading, Hide } from '@chakra-ui/react'
import NavLayout from '~/components/layouts/NavLayout'
import styles from './style.scss';
//import { GlobalStateContext } from '~/components/GlobalState/GlobalState'

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser();
  const router = useRouter();

  // may not be necessary - no state management on this page
  //const { globalState } = useContext(GlobalStateContext);
  useEffect(() => {
    console.log('login page user set to', user);
    // globalState.do.set_user(user);
    // globalState.setMeta('supabaseClient', supabaseClient, true);
  }, [user])

  useEffect(() => {
    // Only run query once user is logged in.
    if (user) {
      router.push('/')
    }
  }, [user])

  const authContainer = useRef(null);
  const signInButton = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      console.log('buttons:', authContainer.current?.getElementsByTagName('button'))
      const button = authContainer.current?.getElementsByTagName('button')[0] || [];
      if (button) {
        const wrapper = document.createElement('div');
        wrapper.appendChild(signInButton.current.cloneNode(true));
        wrapper.className=styles.wrapper;
        button.parentNode.replaceChild(wrapper, button );
        console.log('replaced button')
      }
    }, 50)

  }, [])

  return (
    <NavLayout>
      <Flex direction="column" align="center" w="100%" pt={8}>
        <Heading>Sign in to Planboard</Heading>
        <Box pad="medium" w={['100%', '80%', '80%']} ref={authContainer}>
          <Auth
            redirectTo="http://localhost:3000/"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabaseClient}
            providers={[]}
            socialLayout="horizontal"
          />
        </Box>
     <Box visibility="hidden">
        <Button type="submit" ref={signInButton}>Sign In to Planboard</Button>
     </Box>
      </Flex>
    </NavLayout>
  )

}

export default memo(LoginPage);
