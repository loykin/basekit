import { useDatetimeRangeUI } from './UIAdapterContext';
import type {
  ButtonProps,
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectItemProps,
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  InputProps,
  SwitchProps,
  ScrollAreaProps,
} from './UIAdapterContext';

/**
 * Adapter-aware slots. Top-level DatetimeRange files import these instead of `../ui/*`
 * directly, so every render picks up whatever `uiAdapter` is ambient in context.
 */

export function Button(props: ButtonProps) {
  const { Button: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function Popover(props: PopoverProps) {
  const { Popover: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  const { PopoverTrigger: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function PopoverContent(props: PopoverContentProps) {
  const { PopoverContent: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function Select(props: SelectProps) {
  const { Select: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function SelectTrigger(props: SelectTriggerProps) {
  const { SelectTrigger: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function SelectValue(props: SelectValueProps) {
  const { SelectValue: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function SelectContent(props: SelectContentProps) {
  const { SelectContent: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function SelectItem(props: SelectItemProps) {
  const { SelectItem: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function Tabs(props: TabsProps) {
  const { Tabs: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function TabsList(props: TabsListProps) {
  const { TabsList: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { TabsTrigger: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function TabsContent(props: TabsContentProps) {
  const { TabsContent: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function Input(props: InputProps) {
  const { Input: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function Switch(props: SwitchProps) {
  const { Switch: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}

export function ScrollArea(props: ScrollAreaProps) {
  const { ScrollArea: Component } = useDatetimeRangeUI();
  return <Component {...props} />;
}
