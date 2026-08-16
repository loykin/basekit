import { useCronInputUI } from './UIAdapterContext';
import type {
  ButtonProps,
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './UIAdapterContext';

/**
 * Adapter-aware slots. Top-level CronInput files import these instead of `../ui/*`
 * directly, so every render picks up whatever `uiAdapter` is ambient in context.
 */

export function Button(props: ButtonProps) {
  const { Button: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function Popover(props: PopoverProps) {
  const { Popover: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  const { PopoverTrigger: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function PopoverContent(props: PopoverContentProps) {
  const { PopoverContent: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function Tabs(props: TabsProps) {
  const { Tabs: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function TabsList(props: TabsListProps) {
  const { TabsList: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { TabsTrigger: Component } = useCronInputUI();
  return <Component {...props} />;
}

export function TabsContent(props: TabsContentProps) {
  const { TabsContent: Component } = useCronInputUI();
  return <Component {...props} />;
}
