import React from 'react';
import { FlexPlugin } from 'flex-plugin';
import OutboundChatPanel from './components/OutboundChatPanel';

const PLUGIN_NAME = 'OutboundSmsPlugin';

export default class OutboundSmsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {

    flex.OutboundDialerPanel.Content.add(
      <OutboundChatPanel manager={manager} key="outbound-sms-panel" />
    );

  }

}
