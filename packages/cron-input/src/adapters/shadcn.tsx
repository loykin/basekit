import type { ElementType } from 'react';
import type {
  CronInputUIAdapter,
  ButtonProps,
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from '../core/UIAdapterContext';

export interface ShadcnAdapterComponents {
  Button: ElementType;
  Popover: ElementType;
  PopoverTrigger: ElementType;
  PopoverContent: ElementType;
  Tabs: ElementType;
  TabsList: ElementType;
  TabsTrigger: ElementType;
  TabsContent: ElementType;
}

// base-ui's `container` prop accepts a ref OR an element; Radix's Portal only accepts an
// element. Unwrap so `portalContainer` (e.g. for a scoped custom theme) works either way.
function resolveContainer(container: PopoverContentProps['container']): Element | DocumentFragment | null | undefined {
  if (container && typeof container === 'object' && 'current' in container) {
    return container.current as Element | null;
  }
  return container as Element | DocumentFragment | null | undefined;
}

/**
 * Bridges the consumer's own real shadcn/ui components (imported from their app, e.g.
 * `@/components/ui/button`) into a `CronInputUIAdapter` so `<CronInput uiAdapter={...} />`
 * renders with them instead of the built-in @base-ui/react-backed components.
 */
export function createShadcnAdapter(components: ShadcnAdapterComponents): CronInputUIAdapter {
  const {
    Button: ShadcnButton,
    Popover: ShadcnPopover,
    PopoverTrigger: ShadcnPopoverTrigger,
    PopoverContent: ShadcnPopoverContent,
    Tabs: ShadcnTabs,
    TabsList: ShadcnTabsList,
    TabsTrigger: ShadcnTabsTrigger,
    TabsContent: ShadcnTabsContent,
  } = components;

  // cron-input's own 'default' | 'outline' | 'ghost' variants and 'default' | 'sm' sizes
  // are already a subset of shadcn's standard Button API, so no size/variant map is needed
  // here (unlike datetime-range's wider size union).
  function Button(props: ButtonProps) {
    return <ShadcnButton {...props} />;
  }

  function Popover(props: PopoverProps) {
    return <ShadcnPopover {...props} />;
  }

  function PopoverTrigger({ render, disabled }: PopoverTriggerProps) {
    // base-ui's render-prop contract: `render(props, state) => ReactElement`, or a bare
    // element. Radix's `asChild` clones whatever element we hand it and injects its own
    // onClick/aria/ref regardless of the placeholder props/state below.
    const rendered = typeof render === 'function' ? render({}, { disabled: !!disabled, open: false }) : render;

    return (
      <ShadcnPopoverTrigger asChild disabled={disabled}>
        {rendered}
      </ShadcnPopoverTrigger>
    );
  }

  function PopoverContent({ container, className, ...props }: PopoverContentProps) {
    // The consumer's shadcn PopoverContent typically defaults to a generic short-menu
    // width (e.g. w-72/288px), sized for the kind of content shadcn/ui ships by default.
    // That's narrower than cron-input's 5-tab bar needs at the consumer's own (non-cramped)
    // type scale. Fixed (not auto) on purpose: the tab bar's 5 triggers are always all
    // mounted, so its width is constant regardless of which tab is active — but the tab
    // *body* below it isn't (only the active one is mounted), so `w-auto` would resize the
    // card on every tab switch as the widest mounted child changes. w-96 comfortably fits
    // the tab bar with room to spare and stays put across tabs.
    //
    // Same reasoning for height: only one tab body is ever mounted at a time, and they're
    // not all the same height (Custom's expression breakdown is the tallest), so an
    // auto-height card would grow/shrink on every tab switch too. min-h pins it to the
    // tallest tab's height so the card holds still regardless of which tab is active.
    //
    // flex-col here (paired with the Tabs wrapper below getting flex-1) is what actually
    // pins the footer to the bottom edge instead of just leaving it floating above a gap:
    // without it, min-h padded the *card*, but the footer — a plain sibling after Tabs —
    // stayed at its natural document-flow position right after whatever short tab body was
    // showing, i.e. it visibly moved between tabs even though the card itself didn't.
    //
    // p-0 + overflow-hidden: the built-in footer (.cron-input-footer) is designed edge-to-
    // edge — its own gray background and top border are meant to span the full width of an
    // unpadded container. The consumer's shadcn PopoverContent defaults to p-4 on every
    // side, which insets the footer into a floating gray box instead. Padding moves onto
    // the Tabs wrapper below so only the tab area is inset; the footer stays flush, and
    // overflow-hidden clips it to the card's own rounded corners.
    //
    // cron-input-shadcn-scale: NumberStepper/DayChips/TimePicker/the Custom-tab input
    // aren't part of the uiAdapter surface, so they still render at the built-in's
    // 11-14px/~28px scale — visibly undersized next to this card's real shadcn (~14px/
    // ~36px) typography. This marker class (see styles/index.css) bumps them to match.
    const sized = className
      ? `w-96 min-h-[17rem] flex flex-col p-0 overflow-hidden cron-input-shadcn-scale ${className}`
      : 'w-96 min-h-[17rem] flex flex-col p-0 overflow-hidden cron-input-shadcn-scale';
    return <ShadcnPopoverContent {...props} className={sized} container={resolveContainer(container)} />;
  }

  function Tabs({ className, ...props }: TabsProps) {
    // flex-1 makes the tab-list+body block absorb the leftover vertical space (from the
    // card's fixed min-h), so the footer — its sibling in PopoverContent's flex column —
    // gets pushed flush to the bottom instead of trailing right after a short tab body.
    // p-4 replaces the padding PopoverContent no longer applies (moved here so the footer,
    // Tabs' sibling, can stay unpadded/edge-to-edge — see PopoverContent above).
    const grown = className ? `flex-1 p-4 ${className}` : 'flex-1 p-4';
    return <ShadcnTabs {...props} className={grown} />;
  }

  function TabsList({ className, ...props }: TabsListProps) {
    // The built-in tab bar forces 5 equal-width columns (CSS grid); shadcn's default
    // TabsList sizes to its content instead, so each trigger ends up exactly as wide as
    // its own label — "Daily" narrower than "Monthly". w-full (combined with each
    // trigger's own flex-1) restores the even, grid-like column split.
    const widened = className ? `w-full ${className}` : 'w-full';
    return <ShadcnTabsList {...props} className={widened} />;
  }

  function TabsTrigger(props: TabsTriggerProps) {
    return <ShadcnTabsTrigger {...props} />;
  }

  function TabsContent({ className, ...props }: TabsContentProps) {
    // TabsContent already gets flex-1 from the consumer's own shadcn styles, so it fills
    // whatever leftover height the fixed-height card has for the (single, short) mounted
    // tab body — but that only sizes the *box*; the body inside it (.cron-input-tab-body,
    // a plain flex column) still stacks at the top of that box by default. flex+justify-
    // center here centers the body vertically within the available space instead of
    // leaving it pinned to the top with dead air below it before the footer.
    const centered = className ? `flex flex-col justify-center ${className}` : 'flex flex-col justify-center';
    return <ShadcnTabsContent {...props} className={centered} />;
  }

  return {
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  };
}
