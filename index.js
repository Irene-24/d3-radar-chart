const NUM_OF_SIDES = 5;
NUM_OF_LEVEL = 4,
    size = Math.min( window.innerWidth, window.innerHeight, 400 ),
    offset = Math.PI,
    polyangle = ( Math.PI * 2 ) / NUM_OF_SIDES,
    r = 0.8 * size,
    r_0 = r / 2,
    center =
    {
        x: size / 2,
        y: size / 2
    };


const tooltip = d3.select( ".tooltip" );

const generateData = ( length ) =>
{
    const data = [];
    const min = 25;
    const max = 100;


    for ( let i = 0; i < length; i++ ) 
    {
        data.push(
            {
                name: "Label",
                value: Math.round( min + ( ( max - min ) * Math.random() ) )
            }
        );
    }

    return data;

};

const genTicks = levels =>
{
    const ticks = [];
    const step = 100 / levels;
    for ( let i = 0; i <= levels; i++ ) 
    {
        const num = step * i;
        if ( Number.isInteger( step ) )
        {
            ticks.push( num );
        }
        else
        {
            ticks.push( num.toFixed( 2 ) );
        }


    }

    return ticks;
};

const ticks = genTicks( NUM_OF_LEVEL );
const dataset = generateData( NUM_OF_SIDES );

const wrapper = d3.select( ".chart" )
    .append( "svg" )
    .attr( "width", size )
    .attr( "height", size );

const g = d3.select( "svg" ).append( "g" );

const scale = d3.scaleLinear()
    .domain( [ 0, 100 ] )
    .range( [ 0, r_0 ] )
    .nice();

const generatePoint = ( { length, angle } ) =>
{
    const point =
    {
        x: center.x + ( length * Math.sin( offset - angle ) ),
        y: center.y + ( length * Math.cos( offset - angle ) )
    };
    return point;
};

const drawPath = ( points, parent ) =>
{
    const lineGenerator = d3.line()
        .x( d => d.x )
        .y( d => d.y );

    parent.append( "path" )
        .attr( "d", lineGenerator( points ) );
};

const generateAndDrawLevels = ( levelsCount, sideCount ) =>
{

    for ( let level = 1; level <= levelsCount; level++ ) 
    {
        const hyp = ( level / levelsCount ) * r_0;

        const points = [];
        for ( let vertex = 0; vertex < sideCount; vertex++ ) 
        {
            const theta = vertex * polyangle;

            points.push( generatePoint( { length: hyp, angle: theta } ) );

        }
        const group = g.append( "g" ).attr( "class", "levels" );
        drawPath( [ ...points, points[ 0 ] ], group );
    }


};

const generateAndDrawLines = ( sideCount ) =>
{

    const group = g.append( "g" ).attr( "class", "grid-lines" );
    for ( let vertex = 1; vertex <= sideCount; vertex++ ) 
    {
        const theta = vertex * polyangle;
        const point = generatePoint( { length: r_0, angle: theta } );

        drawPath( [ center, point ], group );
    }

};

const drawCircles = points =>
{
    const mouseEnter = d =>
    {
        // console.log( d3.event );
        tooltip.style( "opacity", 1 );
        const { x, y } = d3.event;
        tooltip.style( "top", `${ y - 20 }px` );
        tooltip.style( "left", `${ x + 15 }px` );
        tooltip.text( d.value );
    };

    const mouseLeave = d =>
    {
        tooltip.style( "opacity", 0 );
    };

    g.append( "g" )
        .attr( "class", "indic" )
        .selectAll( "circle" )
        .data( points )
        .enter()
        .append( "circle" )
        .attr( "cx", d => d.x )
        .attr( "cy", d => d.y )
        .attr( "r", 8 )
        .on( "mouseenter", mouseEnter )
        .on( "mouseleave", mouseLeave );



};

const drawText = ( text, point, isAxis, group ) =>
{
    if ( isAxis )
    {
        const xSpacing = text.toString().includes( "." ) ? 30 : 22;
        group.append( "text" )
            .attr( "x", point.x - xSpacing )
            .attr( "y", point.y + 5 )
            .html( text )
            .style( "text-anchor", "middle" )
            .attr( "fill", "darkgrey" )
            .style( "font-size", "12px" )
            .style( "font-family", "sans-serif" );
    }
    else
    {
        group.append( "text" )
            .attr( "x", point.x )
            .attr( "y", point.y )
            .html( text )
            .style( "text-anchor", "middle" )
            .attr( "fill", "darkgrey" )
            .style( "font-size", "12px" )
            .style( "font-family", "sans-serif" );
    }

};

const drawData = ( dataset, n ) =>
{
    const points = [];
    dataset.forEach( ( d, i ) => 
    {

        const len = scale( d.value );
        const theta = i * ( 2 * Math.PI / n );

        points.push(
            {
                ...generatePoint( { length: len, angle: theta } ),
                value: d.value
            } );
    } );

    const group = g.append( "g" ).attr( "class", "shape" );

    drawPath( [ ...points, points[ 0 ] ], group );
    drawCircles( points );
};

const drawAxis = ( ticks, levelsCount ) =>
{
    const groupL = g.append( "g" ).attr( "class", "tick-lines" );
    const point = generatePoint( { length: r_0, angle: 0 } );
    drawPath( [ center, point ], groupL );

    const groupT = g.append( "g" ).attr( "class", "ticks" );

    ticks.forEach( ( d, i ) =>
    {
        const r = ( i / levelsCount ) * r_0;
        const p = generatePoint( { length: r, angle: 0 } );
        const points =
            [
                p,
                {
                    ...p,
                    x: p.x - 10
                }

            ];
        drawPath( points, groupL );
        drawText( d, p, true, groupT );


    } );


};

const drawLabels = ( dataset, sideCount ) =>
{
    const groupL = g.append( "g" ).attr( "class", "labels" );
    for ( let vertex = 0; vertex < sideCount; vertex++ ) 
    {

        const angle = vertex * polyangle;
        const label = dataset[ vertex ].name;
        const point = generatePoint( { length: 0.9 * ( size / 2 ), angle } );

        drawText( label, point, false, groupL );
    }
};

generateAndDrawLevels( NUM_OF_LEVEL, NUM_OF_SIDES );
generateAndDrawLines( NUM_OF_SIDES );
drawAxis( ticks, NUM_OF_LEVEL );
drawData( dataset, NUM_OF_SIDES );
drawLabels( dataset, NUM_OF_SIDES );
