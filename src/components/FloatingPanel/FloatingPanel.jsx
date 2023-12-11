import React, { useRef, useState, useEffect, useCallback } from "react";
import { ResizeSensor } from "@blueprintjs/core";
import "./FloatingPanel.scss";
import ListItemWithIcon from "components/ListItemWithIcon/ListItemWithIcon";
import { useTabletDimension } from "utils/hooks";
import { test } from "utils/helpers";
import { useTranslation } from "react-i18next";

const FloatingPanel = ({
  list,
  className,
  title,
  onClose,
  itemsInProgress,
  content,
  isMinimizable = true,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("LEFT");
  const [isTablet] = useTabletDimension();
  const floatPanel = useRef();

  const [xPos, setXPos] = useState("auto");
  const [yPos, setYPos] = useState("auto");
  const [dragStartMouseX, setDragStartMouseX] = useState(null);
  const [dragStartMouseY, setDragStartMouseY] = useState(null);
  const [panelStartX, setPanelStartX] = useState(null);
  const [panelStartY, setPanelStartY] = useState(null);
  const [panelHeight, setPanelHeight] = useState(null);
  const [panelWidth, setPanelWidth] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.stopPropagation();
      if (!e.changedTouches) {
        e.preventDefault();
      }

      const eventX = e.pageX ?? e.changedTouches[0]?.pageX;
      const eventY = e.pageY ?? e.changedTouches[0]?.pageY;
      const xCoord =
        panelStartX + (eventX - dragStartMouseX) > 0
          ? panelWidth + panelStartX + (eventX - dragStartMouseX) <
            floatPanel.current.offsetParent.offsetWidth
            ? panelStartX + (eventX - dragStartMouseX)
            : floatPanel.current.offsetLeft
          : 0;
      const yCoord =
        panelStartY + (eventY - dragStartMouseY) > 0
          ? panelHeight + panelStartY + (eventY - dragStartMouseY) <
            floatPanel.current.offsetParent.offsetHeight
            ? panelStartY + (eventY - dragStartMouseY)
            : floatPanel.current.offsetTop
          : 0;
      setXPos(xCoord);
      setYPos(yCoord);
    },
    [
      dragStartMouseX,
      dragStartMouseY,
      isDragging,
      panelHeight,
      panelStartX,
      panelStartY,
      panelWidth,
    ]
  );

  useEffect(() => {
    if (!isMinimized) {
      if (
        floatPanel.current?.offsetTop +
          floatPanel.current?.offsetHeight -
          floatPanel.current?.offsetParent?.offsetHeight >
        0
      ) {
        setYPos(
          floatPanel.current?.offsetParent?.offsetHeight -
            floatPanel.current?.offsetHeight
        );
      }
    }
  }, [isMinimized]);

  useEffect(() => {
    if (
      floatPanel.current?.offsetHeight + yPos >=
      floatPanel.current?.offsetParent?.offsetHeight
    ) {
      setYPos(
        floatPanel.current.offsetParent.offsetHeight -
          floatPanel.current.offsetHeight
      );
    }
  }, [isTablet, yPos]);

  const onMouseUp = useCallback((e) => {
    setIsDragging(false);
    e.stopPropagation();
    if (!e.changedTouches) {
      e.preventDefault();
    }
  }, []);

  const onMouseDown = useCallback((e) => {
    e.stopPropagation();
    if (!e.changedTouches) {
      e.preventDefault();
    }

    const {
      x: elX,
      y: elY,
      height,
      width,
    } = floatPanel.current.getBoundingClientRect();
    const { x: parentX, y: parentY } =
      floatPanel.current.offsetParent.getBoundingClientRect?.() || {};

    setIsDragging(true);
    setDragStartMouseX(e.pageX ?? e.changedTouches[0]?.pageX);
    setDragStartMouseY(e.pageY ?? e.changedTouches[0]?.pageY);
    setPanelStartX(elX - (parentX ?? 0));
    setPanelStartY(elY - (parentY ?? 0));
    setPanelHeight(height);
    setPanelWidth(width);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("touchmove", onMouseMove);
      document.addEventListener("touchend", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  const handleResize = (entries) => {
    if (floatPanel.current) {
      const floatPanelRect = floatPanel.current?.getBoundingClientRect?.();

      if (entries[0].contentRect.width < floatPanelRect?.width + 420) {
        setTooltipPosition("TOP");
      } else {
        setTooltipPosition("LEFT");
      }

      if (
        floatPanel.current?.offsetLeft + floatPanel.current?.offsetWidth >
        entries[0].contentRect.width
      ) {
        floatPanel.current.style = null;
      }
    }
  };

  useEffect(() => {
    document.getElementById("float-panel-title")?.focus();
    return () => {
      document.querySelector('[data-test-id="OPEN_MODERATION_PANEL"]')?.focus();
    };
  }, []);

  return (
    <>
      {!isTablet && (
        <ResizeSensor onResize={handleResize}>
          <div className="vc-floating-panel-overlay"></div>
        </ResizeSensor>
      )}
      <div
        className={
          isMinimized
            ? `vc-floating-panel vc-floating-panel--minimized ${
                className || ""
              }`
            : `vc-floating-panel ${className || ""}`
        }
        ref={floatPanel}
        style={{ left: xPos, top: yPos }}
        {...test("FLOATING_PANEL")}
      >
        <div className="vc-floating-panel__head">
          <div
            className="vc-floating-panel__drag"
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
          ></div>
          {title && (
            <div
              tabIndex="0"
              id="float-panel-title"
              className="vc-floating-panel__title"
            >
              {title}
            </div>
          )}
          <div className="vc-floating-panel__ctrls">
            {isMinimizable && (
              <div
                tabIndex="0"
                role="button"
                aria-label={
                  isMinimized
                    ? `${t("EXPAND")} ${t("PANEL")}`
                    : `${t("MINIMIZE")} ${t("PANEL")}`
                }
                className="vc-floating-panel__minimize-toggle"
                onClick={() => setIsMinimized((prev) => !prev)}
                {...test("TOGGLE_FLOATING_PANEL")}
              ></div>
            )}
            <div
              tabIndex="0"
              role="button"
              aria-label={`${t("CLOSE")} ${t("PANEL")}`}
              className="vc-floating-panel__close"
              onClick={onClose}
              {...test("CLOSE_FLOATING_PANEL")}
            ></div>
          </div>
        </div>
        <div className="vc-floating-panel__body">
          {content && <ul className="vc-floating-panel__content">{content}</ul>}
          {list && (
            <ul className="vc-floating-panel__list">
              {list.map((item) => {
                const isInProgress = itemsInProgress.some(
                  (el) => el === item.id
                );
                return (
                  <ListItemWithIcon
                    data={item}
                    parent={floatPanel.current.offsetParent}
                    key={item.id}
                    tooltipPosition={tooltipPosition}
                    inprogress={isInProgress}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingPanel;
