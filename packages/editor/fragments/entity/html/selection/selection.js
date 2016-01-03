import BaseCollection from 'common/collection';
import { clone } from 'common/utils/object';
import { SetFocusMessage } from 'editor/message-types';
import BoundingRect from 'common/geom/bounding-rect';
import { ChangeMessage } from 'base/message-types';
import assert from 'assert';

class Preview {
  constructor(selection, notifier) {
    this.selection = selection;
    this.notifier  = notifier;
  }

  setProperties(properties) {
    Object.assign(this, properties);
    for (var entity of this.selection) {
      entity.preview.setProperties(properties);
    }

    this.notifier.notify(ChangeMessage.create());
  }

  setPositionFromAbsolutePoint(point) {

    var bounds = this.getStyle();

    this.selection.map(function(entity) {
      var pstyle = entity.preview.getStyle();
      entity.preview.setPositionFromAbsolutePoint({
        left: point.left + (pstyle.left - bounds.left),
        top : point.top  + (pstyle.top  - bounds.top)
      });
    });
  }

  /**
   * returns the capabilities of the element - is it movable? Basically
   * things that turn tools on or off
   * @returns {{movable:Boolean}}
   */

  getCapabilities() {

    var capabilities = {};
    for (var item of this.selection) {
      var ic = item.preview.getCapabilities();
      for (var name in ic) {
        capabilities[name] = capabilities[name] === false ? false : ic[name];
      }
    }

    return capabilities;
  }

  setBounds(bounds) {

    var cstyle = this.getStyle();

    // otherwise reposition the items
    this.selection.forEach(function(entity) {
      var style = entity.preview.getStyle();

      var percLeft   = (style.left - cstyle.left) / cstyle.width;
      var percTop    = (style.top  - cstyle.top)  / cstyle.height;
      var percWidth  = style.width / cstyle.width;
      var percHeight = style.height / cstyle.height;

      entity.preview.setBounds({
        left: bounds.left + bounds.width * percLeft,
        top: bounds.top + bounds.height * percTop,
        width: bounds.width * percWidth,
        height: bounds.height * percHeight
      });
    });
  }

  getBoundingRect(zoomProperties) {
    var allRects = this.selection.map(function(entity) {
      return entity.preview.getBoundingRect(zoomProperties);
    });

    var groupRect = {
      top    : Infinity,
      bottom : -Infinity,
      left   : Infinity,
      right  : -Infinity
    };

    for (var rect of allRects) {
      groupRect.left   = Math.min(groupRect.left, rect.left);
      groupRect.right  = Math.max(groupRect.right, rect.right);
      groupRect.top    = Math.min(groupRect.top, rect.top);
      groupRect.bottom = Math.max(groupRect.bottom, rect.bottom);
    }

    return BoundingRect.create(groupRect);
  }

  getStyle() {
    var allStyles = this.selection.map(function(entity) {
      return entity.preview.getStyle();
    });

    var bounds = {
      top    : Infinity,
      bottom : -Infinity,
      left   : Infinity,
      right  : -Infinity
    };

    for (var style of allStyles) {

      bounds.left   = Math.min(bounds.left, style.left);
      bounds.right  = Math.max(bounds.right, style.left + style.width);
      bounds.top    = Math.min(bounds.top, style.top);
      bounds.bottom = Math.max(bounds.bottom, style.top + style.height);
    }

    bounds.width  = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;

    return bounds;
  }
}

class HTMLEntitySelection extends BaseCollection {

  constructor(properties) {
    super(properties);
    this.preview = new Preview(this, this.notifier);
  }

  setStyle(style) {
    this.forEach(function(entity) {
      entity.setStyle(style);
    })
  }

  setAttribute(key, value) {
    for (var entity of this) {
      entity.setAttribute(key, value);
    }
  }

  get value() {
    return this[0].value;
  }

  get type () {
    return this[0].type;
  }

  get componentType() {
    return this[0].componentType;
  }

  get attributes() {
    return this[0].attributes;
  }

  setProperties(properties) {
    super.setProperties(properties);
    for (var item of this) {
      item.setProperties(properties);
    }
  }

  serialize() {
    return {
      type: 'html-selection',
      items: this.map(function(entity) {
        return entity.serialize();
      })
    };
  }

  getStyle() {
    var selectionStyle = clone(this[0].getStyle());

    // take away styles from here

    this.slice(1).forEach(function(entity) {
      var style = entity.getStyle();
      for (var key in selectionStyle) {
        if (selectionStyle[key] !== style[key]) {
          delete selectionStyle[key];
        }
      }
    });

    return selectionStyle;
  }

  deleteAll() {

    for (var entity of this) {

      assert(entity.parent, 'Attempting to delete selected entity which does not belong to any parent entity. Therefore it\'s a root entity, or it should not exist.');

      var entityIndex  = entity.parent.children.indexOf(focus);
      //var nextSibling = entityIndex ? entity.parent.children[entityIndex - 1] : entity.parent.children[entityIndex + 1];
      // remove the child deleted
      entity.parent.children.remove(entity);
    }
  }
}

export default HTMLEntitySelection;