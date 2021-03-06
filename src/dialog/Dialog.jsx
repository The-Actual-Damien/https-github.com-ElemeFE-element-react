/* @flow */

import React from 'react';
import { Component, View, Transition, PropTypes } from '../../libs';
import { cleanScrollBar } from '../table/utils';

type State = {
  bodyOverflow: string,
}

export default class Dialog extends Component {
  state: State;

  static defaultProps = {
    visible: false,
    title: '',
    size: 'small',
    top: '15%',
    modal: true,
    lockScroll: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    showClose: true
  }

  constructor(props: Object) {
    super(props);
    this.wrap = React.createRef();
    this.state = {
      bodyOverflow: ''
    }
  }

  componentWillReceiveProps(nextProps: Object): void {
    const { bodyOverflow } = this.state;
    const { lockScroll, modal } = this.props;
    if (this.willOpen(this.props, nextProps)) {
      cleanScrollBar();
      if (lockScroll && document.body && document.body.style) {
        if (!bodyOverflow) {
          this.setState({
            bodyOverflow: document.body.style.overflow
          });
        }
        document.body.style.overflow = 'hidden';
      }
    }

    if (this.willClose(this.props, nextProps) && lockScroll) {
      if (modal && bodyOverflow !== 'hidden' && document.body && document.body.style) {
        document.body.style.overflow = bodyOverflow;
      }
    }

  }

  componentDidUpdate(prevProps: Object): void {
    if (this.willOpen(prevProps, this.props)) {
      this.wrap.current.focus();
    }
  }

  componentWillUnmount(): void {
    const { lockScroll } = this.props;
    if (lockScroll && document.body && document.body.style) {
      document.body.style.removeProperty('overflow');
    }
  }

  onKeyDown(e: SyntheticKeyboardEvent<any>): void {
    const { closeOnPressEscape } = this.props;
    if (closeOnPressEscape && e.keyCode === 27) {
      this.close(e);
    }
  }

  handleWrapperClick(e: SyntheticEvent<HTMLDivElement>): void {
    const { closeOnClickModal } = this.props;
    if (e.target instanceof HTMLDivElement) {
      if (closeOnClickModal && e.target === e.currentTarget) {
        this.close(e);
      }
    }
  }

  close(e: any): void {
    this.props.onCancel(e);
  }

  willOpen(prevProps: Object, nextProps: Object): boolean {
    return (!prevProps.visible && nextProps.visible);
  }

  willClose(prevProps: Object, nextProps: Object): boolean {
    return (prevProps.visible && !nextProps.visible);
  }

  render(): React.DOM {
    const { visible, title, size, top, modal, customClass, showClose, children } = this.props;

    return (
      <div>
        <Transition name="dialog-fade">
          <View show={visible}>
            <div
              ref={this.wrap}
              style={{ zIndex: 1013 }}
              className={this.classNames('el-dialog__wrapper')}
              onClick={e => this.handleWrapperClick(e)}
              onKeyDown={e => this.onKeyDown(e)}
            >
              <div
                ref="dialog"
                style={this.style(size === 'full' ? {} : { 'top': top })}
                className={this.className("el-dialog", `el-dialog--${ size }`, customClass)}
              >
                <div className="el-dialog__header">
                  <span className="el-dialog__title">{title}</span>
                  {
                    showClose && (
                      <button type="button" className="el-dialog__headerbtn" onClick={e => this.close(e)}>
                        <i className="el-dialog__close el-icon el-icon-close" />
                      </button>
                    )
                  }
                </div>
                {children}
              </div>
            </div>
          </View>
        </Transition>
        {
          modal && (
            <View show={visible}>
              <div className="v-modal" style={{ zIndex: 1012 }} />
            </View>
          )
        }
      </div>
    );
  }
}

Dialog.propTypes = {
  // ???????????????????????????
  visible: PropTypes.bool.isRequired,
  // ??????
  title: PropTypes.string,
  // ?????? (tiny/small/large/full)
  size: PropTypes.string,
  // top ???????????? size ?????? full ????????????
  top: PropTypes.string,
  // ?????????????????????
  modal: PropTypes.bool,
  // Dialog ??????????????????
  customClass: PropTypes.string,
  // ????????? Dialog ???????????? body ????????????
  lockScroll: PropTypes.bool,
  // ???????????????????????? modal ?????? Dialog
  closeOnClickModal: PropTypes.bool,
  // ???????????????????????? ESC ?????? Dialog
  closeOnPressEscape: PropTypes.bool,
  // ??????????????????????????????????????????????????????
  onCancel: PropTypes.func.isRequired,
  showClose: PropTypes.bool
};
