import React, { createContext, useContext, useMemo } from 'react';
import { Button as DefaultButton } from '../ui/button';
import { Popover as DefaultPopover, PopoverTrigger as DefaultPopoverTrigger, PopoverContent as DefaultPopoverContent } from '../ui/popover';
import {
  Select as DefaultSelect,
  SelectTrigger as DefaultSelectTrigger,
  SelectValue as DefaultSelectValue,
  SelectContent as DefaultSelectContent,
  SelectItem as DefaultSelectItem,
} from '../ui/select';
import { Tabs as DefaultTabs, TabsList as DefaultTabsList, TabsTrigger as DefaultTabsTrigger, TabsContent as DefaultTabsContent } from '../ui/tabs';
import { Input as DefaultInput } from '../ui/input';
import { Switch as DefaultSwitch } from '../ui/switch';
import { ScrollArea as DefaultScrollArea } from '../ui/scroll-area';

export type ButtonProps = React.ComponentProps<typeof DefaultButton>;
export type PopoverProps = React.ComponentProps<typeof DefaultPopover>;
export type PopoverTriggerProps = React.ComponentProps<typeof DefaultPopoverTrigger>;
export type PopoverContentProps = React.ComponentProps<typeof DefaultPopoverContent>;
export type SelectProps = React.ComponentProps<typeof DefaultSelect>;
export type SelectTriggerProps = React.ComponentProps<typeof DefaultSelectTrigger>;
export type SelectValueProps = React.ComponentProps<typeof DefaultSelectValue>;
export type SelectContentProps = React.ComponentProps<typeof DefaultSelectContent>;
export type SelectItemProps = React.ComponentProps<typeof DefaultSelectItem>;
export type TabsProps = React.ComponentProps<typeof DefaultTabs>;
export type TabsListProps = React.ComponentProps<typeof DefaultTabsList>;
export type TabsTriggerProps = React.ComponentProps<typeof DefaultTabsTrigger>;
export type TabsContentProps = React.ComponentProps<typeof DefaultTabsContent>;
export type InputProps = React.ComponentProps<typeof DefaultInput>;
export type SwitchProps = React.ComponentProps<typeof DefaultSwitch>;
export type ScrollAreaProps = React.ComponentProps<typeof DefaultScrollArea>;

/**
 * Component-implementation slots DatetimeRange renders through. Every field is optional —
 * an adapter only needs to supply the slots it wants to replace; anything omitted falls
 * back to the built-in implementation.
 */
export interface DatetimeRangeUIAdapter {
  Button?: React.ComponentType<ButtonProps>;
  Popover?: React.ComponentType<PopoverProps>;
  PopoverTrigger?: React.ComponentType<PopoverTriggerProps>;
  PopoverContent?: React.ComponentType<PopoverContentProps>;
  Select?: React.ComponentType<SelectProps>;
  SelectTrigger?: React.ComponentType<SelectTriggerProps>;
  SelectValue?: React.ComponentType<SelectValueProps>;
  SelectContent?: React.ComponentType<SelectContentProps>;
  SelectItem?: React.ComponentType<SelectItemProps>;
  Tabs?: React.ComponentType<TabsProps>;
  TabsList?: React.ComponentType<TabsListProps>;
  TabsTrigger?: React.ComponentType<TabsTriggerProps>;
  TabsContent?: React.ComponentType<TabsContentProps>;
  Input?: React.ComponentType<InputProps>;
  Switch?: React.ComponentType<SwitchProps>;
  ScrollArea?: React.ComponentType<ScrollAreaProps>;
}

export type ResolvedDatetimeRangeUIAdapter = Required<DatetimeRangeUIAdapter>;

export const defaultUIAdapter: ResolvedDatetimeRangeUIAdapter = {
  Button: DefaultButton,
  Popover: DefaultPopover,
  PopoverTrigger: DefaultPopoverTrigger,
  PopoverContent: DefaultPopoverContent,
  Select: DefaultSelect,
  SelectTrigger: DefaultSelectTrigger,
  SelectValue: DefaultSelectValue,
  SelectContent: DefaultSelectContent,
  SelectItem: DefaultSelectItem,
  Tabs: DefaultTabs,
  TabsList: DefaultTabsList,
  TabsTrigger: DefaultTabsTrigger,
  TabsContent: DefaultTabsContent,
  Input: DefaultInput,
  Switch: DefaultSwitch,
  ScrollArea: DefaultScrollArea,
};

const DatetimeRangeUIContext = createContext<ResolvedDatetimeRangeUIAdapter>(defaultUIAdapter);

export function useResolvedDatetimeRangeUI(adapter?: DatetimeRangeUIAdapter): ResolvedDatetimeRangeUIAdapter {
  const parent = useContext(DatetimeRangeUIContext);
  return useMemo(() => (adapter ? { ...parent, ...adapter } : parent), [parent, adapter]);
}

export interface DatetimeRangeProviderProps {
  adapter?: DatetimeRangeUIAdapter;
  children: React.ReactNode;
}

/** Makes a `uiAdapter` ambient for every DatetimeRange/SidePanel instance nested below it. */
export function DatetimeRangeProvider({ adapter, children }: DatetimeRangeProviderProps) {
  const value = useResolvedDatetimeRangeUI(adapter);
  return <DatetimeRangeUIContext.Provider value={value}>{children}</DatetimeRangeUIContext.Provider>;
}

export function useDatetimeRangeUI(): ResolvedDatetimeRangeUIAdapter {
  return useContext(DatetimeRangeUIContext);
}
