import type { ElementType } from 'react';
import type {
  DatetimeRangeUIAdapter,
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
} from '../core/UIAdapterContext';

export interface ShadcnAdapterComponents {
  Button: ElementType;
  Popover: ElementType;
  PopoverTrigger: ElementType;
  PopoverContent: ElementType;
  Select: ElementType;
  SelectTrigger: ElementType;
  SelectValue: ElementType;
  SelectContent: ElementType;
  SelectItem: ElementType;
  Tabs: ElementType;
  TabsList: ElementType;
  TabsTrigger: ElementType;
  TabsContent: ElementType;
  Switch: ElementType;
  Input: ElementType;
  /**
   * Optional. `TimePicker`'s hour/minute/second lists scroll themselves to the selected
   * value via a `viewportRef` prop — a contract a generic shadcn ScrollArea may not expose.
   * Omit to keep the built-in scroll-to-selection behavior; only pass one that forwards
   * `viewportRef` to its scrollable viewport element.
   */
  ScrollArea?: ElementType;
}

// base-ui's `container` prop accepts a ref OR an element; Radix's Portal only accepts an
// element. Unwrap so `portalContainer` (e.g. for a scoped custom theme) works either way.
function resolveContainer(container: PopoverContentProps['container']): Element | DocumentFragment | null | undefined {
  if (container && typeof container === 'object' && 'current' in container) {
    return container.current as Element | null;
  }
  return container as Element | DocumentFragment | null | undefined;
}

const buttonSizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'default',
  xs: 'sm',
  sm: 'sm',
  lg: 'lg',
  icon: 'icon',
  'icon-xs': 'icon-sm',
  'icon-sm': 'icon-sm',
  'icon-lg': 'icon-lg',
};

/**
 * Bridges the consumer's own real shadcn/ui components (imported from their app, e.g.
 * `@/components/ui/button`) into a `DatetimeRangeUIAdapter` so `<DatetimeRange uiAdapter={...} />`
 * renders with them instead of the built-in @base-ui/react-backed components.
 */
export function createShadcnAdapter(components: ShadcnAdapterComponents): DatetimeRangeUIAdapter {
  const {
    Button: ShadcnButton,
    Popover: ShadcnPopover,
    PopoverTrigger: ShadcnPopoverTrigger,
    PopoverContent: ShadcnPopoverContent,
    Select: ShadcnSelect,
    SelectTrigger: ShadcnSelectTrigger,
    SelectValue: ShadcnSelectValue,
    SelectContent: ShadcnSelectContent,
    SelectItem: ShadcnSelectItem,
    Tabs: ShadcnTabs,
    TabsList: ShadcnTabsList,
    TabsTrigger: ShadcnTabsTrigger,
    TabsContent: ShadcnTabsContent,
    Switch: ShadcnSwitch,
    Input: ShadcnInput,
    ScrollArea: ShadcnScrollArea,
  } = components;

  // type="button" default: a plain <button>/shadcn Button with no explicit `type` is
  // type="submit" per the HTML spec — inside a real <form> (a datetime field almost
  // always is one), clicking it submits the form instead of just doing its own thing.
  // Stock shadcn/ui Button templates don't default this themselves, so without it here
  // every Button in this package would silently submit an enclosing form when adapted.
  function Button({ size = 'default', type = 'button', ...props }: ButtonProps) {
    return <ShadcnButton size={buttonSizeMap[size]} type={type} {...props} />;
  }

  function Popover(props: PopoverProps) {
    return <ShadcnPopover {...props} />;
  }

  function PopoverTrigger({ render, disabled }: PopoverTriggerProps) {
    // base-ui's render-prop contract: `render(props, state) => ReactElement`, or a bare
    // element. Radix's `asChild` clones whatever element we hand it and injects its own
    // onClick/aria/ref regardless of the placeholder props/state below.
    //
    // { type: 'button' } (not {}): the real base-ui Popover.Trigger always includes
    // type: 'button' in the props it hands to a render function, precisely so a bare
    // <button {...triggerProps}> (or <Button {...triggerProps}>) defaults safely. An
    // empty object here silently drops that — the trigger falls back to the browser's
    // type="submit" default and submits any enclosing <form> on click instead of opening
    // the popover. base-ui's own render prop type doesn't declare `type` on its generic
    // HTML props bag even though its runtime always includes it, so the final cast to
    // Parameters<typeof render>[0] is unavoidable — but typing the literal itself first
    // still gets excess-property checking on it, so a future typo'd key or wrong value
    // here doesn't silently pass.
    const placeholderTriggerProps: { type: 'button' } = { type: 'button' };
    // The `state` (2nd) argument's `open: false` is a placeholder too, but a harmless one:
    // DatetimeRange.tsx's own `render={(triggerProps) => ...}` callback only ever
    // destructures the first argument, and the real `open` state it exposes to a
    // consumer's own `renderTrigger` prop is computed separately from DatetimeRange's own
    // React state, not from this placeholder — so no consumer-facing code path ever
    // observes this `false`.
    const rendered = typeof render === 'function' ? render(placeholderTriggerProps as Parameters<typeof render>[0], { disabled: !!disabled, open: false }) : render;

    return (
      <ShadcnPopoverTrigger asChild disabled={disabled}>
        {rendered}
      </ShadcnPopoverTrigger>
    );
  }

  function PopoverContent({
    disableAnchorTracking: _disableAnchorTracking,
    collisionAvoidance: _collisionAvoidance,
    container,
    ...props
  }: PopoverContentProps) {
    // disableAnchorTracking/collisionAvoidance are base-ui-only Positioner props with no
    // Radix equivalent — drop them so they don't leak onto a DOM node. container is real
    // (portalContainer support) but base-ui accepts a ref OR an element while Radix's
    // Portal only accepts an element, so unwrap a ref before forwarding it.
    return <ShadcnPopoverContent {...props} container={resolveContainer(container)} />;
  }

  function Select(props: SelectProps) {
    return <ShadcnSelect {...props} />;
  }

  function SelectTrigger({ size: _size, ...props }: SelectTriggerProps) {
    return <ShadcnSelectTrigger {...props} />;
  }

  function SelectValue(props: SelectValueProps) {
    return <ShadcnSelectValue {...props} />;
  }

  function SelectContent({ alignItemWithTrigger: _alignItemWithTrigger, ...props }: SelectContentProps) {
    // alignItemWithTrigger is a base-ui-only Positioner prop with no Radix equivalent.
    return <ShadcnSelectContent {...props} />;
  }

  function SelectItem(props: SelectItemProps) {
    return <ShadcnSelectItem {...props} />;
  }

  function Tabs(props: TabsProps) {
    return <ShadcnTabs {...props} />;
  }

  function TabsList({ variant: _variant, ...props }: TabsListProps) {
    return <ShadcnTabsList {...props} />;
  }

  function TabsTrigger(props: TabsTriggerProps) {
    return <ShadcnTabsTrigger {...props} />;
  }

  function TabsContent(props: TabsContentProps) {
    return <ShadcnTabsContent {...props} />;
  }

  function Switch({ size: _size, ...props }: SwitchProps) {
    return <ShadcnSwitch {...props} />;
  }

  function Input(props: InputProps) {
    return <ShadcnInput {...props} />;
  }

  function ScrollArea(props: ScrollAreaProps) {
    return ShadcnScrollArea ? <ShadcnScrollArea {...props} /> : null;
  }

  return {
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Switch,
    Input,
    ...(ShadcnScrollArea ? { ScrollArea } : {}),
  };
}
