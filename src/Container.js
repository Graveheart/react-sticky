import React, { PureComponent } from "react";
import raf from "raf";
import StickyContext from './Context';

export default class Container extends PureComponent {
  events = [
    "resize",
    "scroll",
    "touchstart",
    "touchmove",
    "touchend",
    "pageshow",
    "load"
  ];

  subscribers = [];

  rafHandle = null;

  subscribe = handler => {
    this.subscribers = this.subscribers.concat(handler);
  };

  unsubscribe = handler => {
    this.subscribers = this.subscribers.filter(current => current !== handler);
  };

  notifySubscribers = evt => {
    if (!this.framePending) {
      const { currentTarget } = evt;

      this.rafHandle = raf(() => {
        this.framePending = false;
        const { top, bottom } = this.node.getBoundingClientRect();

        this.subscribers.forEach(handler =>
          handler({
            distanceFromTop: top,
            distanceFromBottom: bottom,
            eventSource: currentTarget === window ? document.body : this.node
          })
        );
      });
      this.framePending = true;
    }
  };

  getParent = () => this.node;

  componentDidMount() {
    this.events.forEach(event =>
      window.addEventListener(event, this.notifySubscribers)
    );
  }

  componentWillUnmount() {
    if (this.rafHandle) {
      raf.cancel(this.rafHandle);
      this.rafHandle = null;
    }

    this.events.forEach(event =>
      window.removeEventListener(event, this.notifySubscribers)
    );
  }

  render() {
    return (
      <StickyContext.Provider value={
        {
          subscribe: this.subscribe,
          unsubscribe: this.unsubscribe,
          getParent: this.getParent
        }
      }>
        <div
          {...this.props}
          ref={node => (this.node = node)}
          onScroll={this.notifySubscribers}
          onTouchStart={this.notifySubscribers}
          onTouchMove={this.notifySubscribers}
          onTouchEnd={this.notifySubscribers}
        />
      </StickyContext.Provider>
    );
  }
}
