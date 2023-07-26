import { Button } from '@chakra-ui/react'

const DialogButton = ({ key, onClick, children, label, ...rest}) => (
  <Button mr={3} key={key} onClick={onClick} {...rest}>{label || children}</Button>
)

export default DialogButton;
