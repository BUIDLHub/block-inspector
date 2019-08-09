import React from 'react';
import * as align from 'Constants/alignments';
import cn from 'classnames';
import {
    Row,
    Col
} from 'reactstrap';

import {
    LABEL_CLASS,
    VALUE_CLASS
  } from './common';

export default class BlockInfo extends React.Component {
    render() {
        const {
            blockRange
        } = this.props;
        return (
            <Row className={cn("block-info", align.topCenter, align.full, align.noMarginPad)}>

                <Col md="12" className={cn(align.leftCenter, align.noMarginPad)}>
                    <div className={cn("container", align.noMarginPad, align.full)}>
                        <Row className={cn(align.leftCenter, align.full, align.noMarginPad)}>
                            <Col md="2" className={cn(align.leftCenter, "mr-2", align.noMarginPad)}>
                                <i className={cn("fa fa-cubes", "text-muted", "font-weight-light", "text-3")}/>
                            </Col>
                            <Col md="8" className={cn(LABEL_CLASS)}>
                                Block Range
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col md="12" className={cn(align.leftCenter, align.noMarginPad)}>
                    <Row className={cn(align.leftCenter, align.full, align.noMarginPad)}>
                        <Col md="2" className={cn(align.leftCenter, "mr-2", align.noMarginPad)}>
                            &nbsp;
                        </Col>
                        <Col md="8" className={cn(VALUE_CLASS)}>
                            {blockRange.fromBlock} - {blockRange.toBlock}
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}