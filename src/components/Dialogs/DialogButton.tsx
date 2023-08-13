import { Button } from '@chakra-ui/react'

const DialogButton = ({ onClick, children, label, ...rest}) => (
  <Button mr={3} onClick={onClick} {...rest}>{label || children}</Button>
)

export default DialogButton;
