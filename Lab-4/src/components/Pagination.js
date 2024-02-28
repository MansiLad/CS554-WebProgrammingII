import React from "react";
import {Link} from 'react-router-dom';

export default function Pagination({ page, gotonextpage, gotoprevpage}) {
    return (
    <div>

        {gotoprevpage && 
            <button>
                <Link to={`/events/page/${page}`} onClick={ gotoprevpage }> Previous </Link>
            </button>
        }
        {gotonextpage && 
            <button>
                <Link to={`/events/page/${page}`} onClick={ gotonextpage }> Next </Link>
            </button>
        }


    </div>
    )
}