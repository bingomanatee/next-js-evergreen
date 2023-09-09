import { leafI } from '@wonderlandlabs/forest/lib/types';
import { useCallback, useMemo, useState } from 'react';
import { HStack, IconButton, Input, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { point } from '@turf/helpers'
import useForestFiltered from '~/lib/useForestFiltered'

export function MapPointLabelEditor(props: { state: leafI, pointId: string }) {
  const { state, pointId } = props;
  const { editingLabel } = useForestFiltered(state);

  const point = useMemo(() => {
    return state?.value.points.get(pointId);
  }, [pointId, state?.value.points]);

  const [label, setLabel] = useState<string>(point?.label);
  const updateLabel = useCallback((e) => {
    setLabel(e.target.value);
    state.do.updateLabel(point.id, e.target.value);
  }, [state, point.id])

  const isEditing = useMemo(() => {
      return editingLabel === point.id
    },
    [editingLabel, point.id]);

  const edit = useCallback(() => {
    if (isEditing) {
      state.do.set_editingLabel('');
      return;
    }
    state.do.set_editingLabel(point.id);
    setLabel(point.label);
  }, [state, isEditing, point]);

  return <HStack w="100%" justify="flex-start" sx={{ pointerEvents: 'all' }} spacing={0} p={0} m={0}>
    <IconButton
        size="sm"
        p={0.5}
        colorScheme="white"
        aria-label="edit-label"
        onMouseDown={edit}
        h="auto"
        icon={
          <Image
              alt="edit-label-icon"
              src={isEditing ? "/img/icons/edit-confirm.svg":"/img/icons/edit.svg" }
              height={12}
              width={12}/>
        }
    />
    {
      isEditing ? (
        <Input value={label} variant="outline" size="xs"
               onBlur={state.do.clearEditingLabel} onChange={updateLabel}/>
      ) : (
        <Text noOfLines={1} fontSize="xs" onClick={edit}>{point.label}</Text>
      )
    }
  </HStack>
}
