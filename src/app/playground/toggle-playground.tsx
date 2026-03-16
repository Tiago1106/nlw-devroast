"use client";

import { useState } from "react";

import { Toggle } from "@/components/ui/toggle";

function TogglePlayground() {
  const [isRoastMode, setIsRoastMode] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-sm font-medium text-text-primary">
            States
          </h3>
          <p className="text-sm text-text-secondary">
            Baseline validation for on, off, and disabled states.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Toggle checked label="roast mode" onCheckedChange={() => {}} />
          <Toggle
            checked={false}
            label="roast mode"
            onCheckedChange={() => {}}
          />
          <Toggle
            disabled
            checked
            label="roast mode"
            onCheckedChange={() => {}}
          />
          <Toggle
            disabled
            checked={false}
            label="roast mode"
            onCheckedChange={() => {}}
          />
        </div>
      </article>

      <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-sm font-medium text-text-primary">
            Controlled examples
          </h3>
          <p className="text-sm text-text-secondary">
            Interactive toggles wired to local state for runtime validation.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Toggle
            checked={isRoastMode}
            label="roast mode"
            onCheckedChange={setIsRoastMode}
          />
          <Toggle
            checked={isNotificationsEnabled}
            label="notifications"
            onCheckedChange={setIsNotificationsEnabled}
          />
        </div>
      </article>
    </div>
  );
}

export { TogglePlayground };
