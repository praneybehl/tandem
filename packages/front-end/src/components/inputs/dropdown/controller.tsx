import * as React from "react";
import { compose, pure, withHandlers, withState } from "recompose";
const { DropdownMenuItem } = require("./view.pc");
import { EMPTY_ARRAY } from "tandem-common";

export type DropdownMenuItem = {
  label: string;
  value: any;
};

export type DropdownOuterProps = {
  value?: string;
  options: DropdownMenuItem[];
  onChange?: (item: DropdownMenuItem) => any;
};

export default compose(
  pure,
  withState("menuVisible", "setMenuVisible", false),
  withHandlers({
    onClick: ({ menuVisible, setMenuVisible }) => () => {
      setMenuVisible(!menuVisible);
    },
    onChange: ({ onChange, setMenuVisible }) => (item, event) => {
      if (onChange) {
        onChange(item.value);
      }
      setMenuVisible(false);
    },
    onKeyDown: ({ setMenuVisible }) => event => {
      if (event.key === "Enter") {
        setMenuVisible(true);
      }
    },
    onBlur: ({ setMenuVisible }) => () => {
      setMenuVisible(false);
    }
  }),
  Base => ({
    value,
    options = EMPTY_ARRAY,
    menuVisible,
    onKeyDown,
    onBlur,
    onChange,
    ...rest
  }) => {
    const menuItems = menuVisible
      ? options.map((item, i) => {
          return (
            <DropdownMenuItem key={i} onClick={event => onChange(item, event)}>
              {item.label}
            </DropdownMenuItem>
          );
        })
      : EMPTY_ARRAY;

    const selectedItem = options.find(item => item.value === value);

    return (
      <Base
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        menuOuterProps={{
          style: {
            display: menuItems.length && menuVisible ? "block" : "none"
          }
        }}
        menuProps={{ children: menuItems }}
        labelProps={{ text: (selectedItem && selectedItem.label) || "--" }}
        {...rest}
      />
    );
  }
);