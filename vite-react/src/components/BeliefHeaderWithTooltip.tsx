import * as Tooltip from "@radix-ui/react-tooltip";

export function BeliefHeaderWithTooltip({
  title,
  tooltip,
}: {
  title: string;
  tooltip: string;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <h3 className="text-lg font-bold cursor-help">{title}</h3>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="right"
          align="start"
          className="max-w-xs break-words rounded px-3 py-2 text-sm text-white bg-black shadow-lg z-50"
        >
          {tooltip}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
