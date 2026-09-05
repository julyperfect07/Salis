"use client";

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

function isActiveRoute(pathname: string, href: string) {
  if (pathname === href) return true;
  const isDashboardRoot = href.split("/").filter(Boolean).length === 2;
  return !isDashboardRoot && pathname.startsWith(`${href}/`);
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  const pathname = usePathname();
  return (
    <>
      <FloatingDockDesktop
        items={items}
        pathname={pathname}
        className={desktopClassName}
      />
      <FloatingDockMobile
        items={items}
        pathname={pathname}
        className={mobileClassName}
      />
    </>
  );
};

function FloatingDockMobile({
  items,
  pathname,
  className,
}: Readonly<{
  items: DockItem[];
  pathname: string;
  className?: string;
}>) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Dashboard navigation"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="absolute bottom-full left-0 mb-2 flex flex-col gap-2 rounded-2xl border bg-background/95 p-2 shadow-xl backdrop-blur-xl"
          >
            {items.map((item, index) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  aria-label={item.title}
                  aria-current={active ? "page" : undefined}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "relative flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-primary/10 text-primary",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 h-5 w-1 rounded-full bg-primary" />
                  )}
                  <span className="size-5">{item.icon}</span>
                </motion.a>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-xl backdrop-blur-xl transition hover:text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
    </div>
  );
}

function FloatingDockDesktop({
  items,
  pathname,
  className,
}: Readonly<{
  items: DockItem[];
  pathname: string;
  className?: string;
}>) {
  const mouseY = useMotionValue(Infinity);
  return (
    <motion.nav
      aria-label="Dashboard navigation"
      onMouseMove={(event) => mouseY.set(event.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "hidden flex-col items-center gap-3 rounded-2xl bg-background px-3 py-4 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseY={mouseY}
          active={isActiveRoute(pathname, item.href)}
          key={item.href}
          {...item}
        />
      ))}
    </motion.nav>
  );
}

function IconContainer({
  mouseY,
  title,
  icon,
  href,
  active,
}: Readonly<DockItem & { mouseY: MotionValue<number>; active: boolean }>) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const distance = useTransform(mouseY, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return value - bounds.y - bounds.height / 2;
  });
  const size = useSpring(useTransform(distance, [-120, 0, 120], [42, 62, 42]), {
    mass: 0.1,
    stiffness: 180,
    damping: 15,
  });
  const iconSize = useSpring(
    useTransform(distance, [-120, 0, 120], [19, 29, 19]),
    { mass: 0.1, stiffness: 180, damping: 15 },
  );

  return (
    <a
      href={href}
      aria-label={title}
      aria-current={active ? "page" : undefined}
    >
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground",
          active && "bg-primary/12 text-primary ring-1 ring-primary/20",
        )}
      >
        {active && (
          <motion.span
            layoutId="active-dock-indicator"
            className="absolute -left-3 h-6 w-1 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
          />
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className="absolute left-full ml-3 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span
          style={{ width: iconSize, height: iconSize }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.span>
      </motion.div>
    </a>
  );
}
