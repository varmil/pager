/** @jsx React.DOM */

/**
 * # Stateless Pager component
 *
 * ## Usage
 * ```
 * <Pager current={3}
 *        total={20}
 *        visiblePages={5}
 *        onPageChanged={this.handlePageChanged} />
 * ```
 *
 * ## How it looks like
 * ```
 * 1 | ... | 6 | 7 | 8 | 9 | ...
 * ```
 *
 */

var React = require( 'react' );


/**
 * ## Constants
 */
var FIRST_PAGE  = 1;
var BASE_SHIFT  = 2;


/**
 * ## Constructor
 */
var Pager = React.createClass({displayName: 'Pager',
    propTypes: {
        current:               React.PropTypes.number.isRequired,
        total:                 React.PropTypes.number.isRequired,
        visiblePages:          React.PropTypes.number.isRequired,

        onPageChanged:         React.PropTypes.func,
        onPageSizeChanged:     React.PropTypes.func
    },


    /* ========================= HANDLERS =============================*/
    handleFirstPage: function () {
        if ( this.isPrevDisabled() ) return;
        this.handlePageChanged( FIRST_PAGE );
    },

    /**
     * Chooses page, that is one before min of currently visible
     * pages.
     */
    handleMorePrevPages: function () {
        var blocks = this.calcBlocks();
        this.handlePageChanged( Math.max(this.props.current - blocks.size, BASE_SHIFT) );
    },

    /**
     * Chooses page, that is one after max of currently visible
     * pages.
     */
    handleMoreNextPages: function () {
        var blocks = this.calcBlocks();
        this.handlePageChanged( Math.min(this.props.current + blocks.size, this.props.total) );
    },

    handlePageChanged: function ( el ) {
        var handler = this.props.onPageChanged;
        if ( handler ) handler( el );
    },


    /* ========================= HELPERS ==============================*/
    /**
     * Calculates "blocks" of buttons with page numbers.
     */
    calcBlocks: function () {
        var props      = this.props
          , total      = props.total
          , blockSize  = props.visiblePages
          , current    = props.current

          , blocks     = Math.ceil( total / blockSize )
          , currBlock  = Math.ceil( current / blockSize );

        return {
            total:    blocks,
            current:  currBlock,
            size:     blockSize
        };
    },

    isPrevDisabled: function () {
        return this.props.current === FIRST_PAGE;
    },

    isPrevMoreHidden: function () {
        var blocks = this.calcBlocks();
        return this.props.current <= BASE_SHIFT;
    },

    isNextMoreHidden: function () {
        var blocks = this.calcBlocks();
        return (this.props.current === this.props.total)
            || (this.props.total - this.props.current < blocks.size);
    },

    visibleRange: function () {
        var blocks  = this.calcBlocks()
          , start   = Math.max(FIRST_PAGE, Math.min(this.props.current, this.props.total - (blocks.size - 1)))
          , delta   = this.props.total - start
          , end     = start + ( (delta >= blocks.size) ? blocks.size - 1 : delta );
        return [ start, end ];
    },


    /* ========================= RENDERS ==============================*/
    render: function () {
        var self = this;
        return (
            React.createElement("nav", null,
                React.createElement("ul", {className: "pagination"},
                    React.createElement(Page, {className: "btn-first-page",
                          isActive: (self.props.current === FIRST_PAGE),
                          onClick: this.handleFirstPage}, '1'),

                    React.createElement(Page, {isHidden: this.isPrevMoreHidden(),
                          onClick: this.handleMorePrevPages}, "..."),

                    this.renderPages( this.visibleRange()),

                    React.createElement(Page, {isHidden: this.isNextMoreHidden(),
                          onClick: this.handleMoreNextPages}, "...")
                )
            )
        );
    },


    /**
     * ### renderPages()
     * Renders block of pages' buttons with numbers.
     * @param {Number[]} range - pair of [start, from], `from` - not inclusive.
     * @return {React.Element[]} - array of React nodes.
     */
    renderPages: function ( pair ) {
        var self = this;

        return range( pair[0], pair[1] + 1 ).map(function ( el, idx ) {
            var current = el
              , onClick = self.handlePageChanged.bind(null, current)
              , isActive = (self.props.current === current);

            // First Page is rendered with another special process.
            if (el === FIRST_PAGE) return;

            return (React.createElement(Page, {key: idx, isActive: isActive,
                          className: "btn-numbered-page",
                          onClick: onClick}, el));
        });
    }
});



var Page = React.createClass({displayName: 'Page',
    render: function () {
        var props = this.props;
        if ( props.isHidden ) return null;

        var baseCss = props.className ? props.className + ' ' : ''
          , css     = baseCss
                      + (props.isActive ? 'active' : '')
                      + (props.isDisabled ? ' disabled' : '');

        return (
            React.createElement("li", {key: this.props.key, className: css},
                React.createElement("a", {onClick: this.props.onClick}, this.props.children)
            )
        );
    }
});



function range ( start, end ) {
    var res = [];
    for ( var i = start; i < end; i++ ) {
        res.push( i );
    }

    return res;
}

module.exports = Pager;
// window.Pager = Pager;
