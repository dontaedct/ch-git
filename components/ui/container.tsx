/**
 * @fileoverview Container component for consistent layout and spacing
 * @module components/ui/container
 * @author OSS Hero System
 * @version 1.0.0
 */

import * as React from "react"

export function Container({
  children,
  className = "",
  center = true,
  variant = "page",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  center?: boolean;
  variant?: "page" | "narrow" | "wide" | "full";
}) {
  const maxWidth = {
    page: "80rem",      // 1280px
    narrow: "56rem",    // 896px  
    wide: "96rem",      // 1536px
    full: "none",
  }[variant];

  const padding = {
    page: "1rem 1.5rem",    // 16px 24px
    narrow: "1rem 1.5rem",  // 16px 24px
    wide: "1rem 1.5rem",    // 16px 24px
    full: "0",
  }[variant];

  const containerStyle = {
    display: "block",
    width: "100%",
    maxWidth: maxWidth,
    marginLeft: center ? "auto" : "0",
    marginRight: center ? "auto" : "0",
    padding: padding,
    ...style,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;
