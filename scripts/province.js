(function(){

    'use strict';

    angular
        .module('WnrUIApp')
        .factory('province', province);
        
        function province() {
            function getProvinces() {
                return [
                        {"name":"Alaska","value":"AK"},
                        {"name":"Alabama","value":"AL"},
                        {"name":"Arkansas","value":"AR"},
                        {"name":"American Samoa","value":"AS"},
                        {"name":"Arizona","value":"AZ"},
                        {"name":"California","value":"CA"},
                        {"name":"Colorado","value":"CO"},
                        {"name":"Connecticut","value":"CT"},
                        {"name":"District of Columbia","value":"DC"},
                        {"name":"Delaware","value":"DE"},
                        {"name":"Florida","value":"FL"},
                        {"name":"Georgia","value":"GA"},
                        {"name":"Guam","value":"GU"},
                        {"name":"Hawaii","value":"HI"},
                        {"name":"Iowa","value":"IA"},
                        {"name":"Idaho","value":"ID"},
                        {"name":"Illinois","value":"IL"},
                        {"name":"Indiana","value":"IN"},
                        {"name":"Kansas","value":"KS"},
                        {"name":"Kentucky","value":"KY"},
                        {"name":"Louisiana","value":"LA"},
                        {"name":"Massachusetts","value":"MA"},
                        {"name":"Maryland","value":"MD"},
                        {"name":"Maine","value":"ME"},
                        {"name":"Michigan","value":"MI"},
                        {"name":"Minnesota","value":"MN"},
                        {"name":"Missouri","value":"MO"},
                        {"name":"Northern Mariana Islands","value":"MP"},
                        {"name":"Mississippi","value":"MS"},
                        {"name":"Montana","value":"MT"},
                        {"name":"North Carolina","value":"NC"},
                        {"name":"North Dakota","value":"ND"},
                        {"name":"Nebraska","value":"NE"},
                        {"name":"New Hampshire","value":"NH"},
                        {"name":"New Jersey","value":"NJ"},
                        {"name":"New Mexico","value":"NM"},
                        {"name":"Nevada","value":"NV"},
                        {"name":"New York","value":"NY"},
                        {"name":"Ohio","value":"OH"},
                        {"name":"Oklahoma","value":"OK"},
                        {"name":"Oregon","value":"OR"},
                        {"name":"Pennsylvania","value":"PA"},
                        {"name":"Puerto Rico","value":"PR"},
                        {"name":"Rhode Island","value":"RI"},
                        {"name":"South Carolina","value":"SC"},
                        {"name":"South Dakota","value":"SD"},
                        {"name":"Tennessee","value":"TN"},
                        {"name":"Texas","value":"TX"},
                        {"name":"U. S. Minor Outlying Islands","value":"UM"},
                        {"name":"Utah","value":"UT"},
                        {"name":"Virginia","value":"VA"},
                        {"name":"Virgin Islands of the U. S.","value":"VI"},
                        {"name":"Vermont","value":"VT"},
                        {"name":"Washington","value":"WA"},
                        {"name":"Wisconsin","value":"WI"},
                        {"name":"West Virginia","value":"WV"},
                        {"name":"Wyoming","value":"WY"}
                ];
            }

            return {
                getProvinces: getProvinces
            }
        }
        
})();