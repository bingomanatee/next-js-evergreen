import {useState, useEffect, useCallback} from 'react';
import styles from './ConfirmDialog.module.scss';
/*import stateFactory from './ConfirmDialog.state.ts';
import useForest from "~/lib/useForest";*/
import confirmManager from "~/lib/managers/confirmManager";
import {Box, Button, Heading, HStack, Icon} from "@chakra-ui/react";
import useForestFiltered from "~/lib/useForestFiltered";
import swallowEvent from "~/lib/swallowEvent";

type ConfirmDialogProps = {}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const {id, message, response, data} = useForestFiltered(confirmManager,
      ['id', 'message', 'response', 'data']);


  if (!id) {
    return null;
  }
  return (
      <Box layerStyle="confirm-dialog">
        <Box layerStyle="confirm-dialog-inner">
          <HStack>
            <Heading size="md">{message}</Heading>
            <Button
                colorScheme="blue" onClick={(e) => {
              swallowEvent(e);
              confirmManager.do.confirm();
            }}
                {...(response === true ? {leftIcon: <Icon src="/img/icons/button-ok.svg"/>} : {})}
            >
              {data.okLabel ?? 'OK'}
            </Button>
            <Button
                onClick={(e) => {
                  swallowEvent(e);
                  confirmManager.do.reject();
                }}
                {...(response === false ? {leftIcon: <Icon src="/img/icons/button-cancel.svg"/>} : {})}
            >
              {data.cancelLabel ?? 'Cancel'}
            </Button>
          </HStack>
        </Box>
      </Box>
  );
}
