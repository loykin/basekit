import React, { createContext, useContext, useMemo } from 'react';
import { Button as DefaultButton } from '../ui/button';
import { Popover as DefaultPopover, PopoverTrigger as DefaultPopoverTrigger, PopoverContent as DefaultPopoverContent } from '../ui/popover';
import { Tabs as DefaultTabs, TabsList as DefaultTabsList, TabsTrigger as DefaultTabsTrigger, TabsContent as DefaultTabsContent } from '../ui/tabs';

export type ButtonProps = React.ComponentProps<typeof DefaultButton>;
export type PopoverProps = React.ComponentProps<typeof DefaultPopover>;
export type PopoverTriggerProps = React.ComponentProps<typeof DefaultPopoverTrigger>;
export type PopoverContentProps = React.ComponentProps<typeof DefaultPopoverContent>;
export type TabsProps = React.ComponentProps<typeof DefaultTabs>;
export type TabsListProps = React.ComponentProps<typeof DefaultTabsList>;
export type TabsTriggerProps = React.ComponentProps<typeof DefaultTabsTrigger>;
export type TabsContentProps = React.ComponentProps<typeof DefaultTabsContent>;

/**
 * Component-implementation slots CronInput renders through. Every field is optional —
 * an adapter only needs to supply the slots it wants to replace; anything omitted falls
 * back to the built-in implementation.
 */
export interface CronInputUIAdapter {
  Button?: React.ComponentType<ButtonProps>;
  Popover?: React.ComponentType<PopoverProps>;
  PopoverTrigger?: React.ComponentType<PopoverTriggerProps>;
  PopoverContent?: React.ComponentType<PopoverContentProps>;
  Tabs?: React.ComponentType<TabsProps>;
  TabsList?: React.ComponentType<TabsListProps>;
  TabsTrigger?: React.ComponentType<TabsTriggerProps>;
  TabsContent?: React.ComponentType<TabsContentProps>;
}

export type ResolvedCronInputUIAdapter = Required<CronInputUIAdapter>;

export const defaultUIAdapter: ResolvedCronInputUIAdapter = {
  Button: DefaultButton,
  Popover: DefaultPopover,
  PopoverTrigger: DefaultPopoverTrigger,
  PopoverContent: DefaultPopoverContent,
  Tabs: DefaultTabs,
  TabsList: DefaultTabsList,
  TabsTrigger: DefaultTabsTrigger,
  TabsContent: DefaultTabsContent,
};

const CronInputUIContext = createContext<ResolvedCronInputUIAdapter>(defaultUIAdapter);

export function useResolvedCronInputUI(adapter?: CronInputUIAdapter): ResolvedCronInputUIAdapter {
  const parent = useContext(CronInputUIContext);
  return useMemo(() => (adapter ? { ...parent, ...adapter } : parent), [parent, adapter]);
}

export interface CronInputProviderProps {
  adapter?: CronInputUIAdapter;
  children: React.ReactNode;
}

/** Makes a `uiAdapter` ambient for every CronInput instance nested below it. */
export function CronInputProvider({ adapter, children }: CronInputProviderProps) {
  const value = useResolvedCronInputUI(adapter);
  return <CronInputUIContext.Provider value={value}>{children}</CronInputUIContext.Provider>;
}

export function useCronInputUI(): ResolvedCronInputUIAdapter {
  return useContext(CronInputUIContext);
}
