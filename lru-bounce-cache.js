
var _ = require('underscore');

exports.LRUBounceCache = LRUBounceCache;

function LRUBounceCache(options)
{
    if( this instanceof LRUBounceCache )
    {
        var default_options = {
            buffer_count: 2,
            max_items: 1000,
        };
    
        this._options = _.extend({},default_options,options);
        this._hit_count = 0;
        this._miss_count = 0;
    
        this._cache_list = [];
        for( var i = 0 ; i < this._options.buffer_count ; ++i )
        {
            this._cache_list.push({
                length: 0,
                map: {},
            });
        }
    }
    else
    {
        return new LRUBounceCache(options);
    }
};

LRUBounceCache.prototype.get = function(key)
{
    var self = this;
    var ret;
    _.all(self._cache_list,function(cache,index)
    {
        if( key in cache.map )
        {
            ret = cache.map[key];
            if( index > 0 )
            {
                self.set(key,ret);
            }
            self._hit_count++;
            return false;
        }
        else
        {
            return true;
        }
    });
    if( typeof ret === 'undefined' )
    {
        self._miss_count++;
    }
    return ret;
};

LRUBounceCache.prototype.set = function(key,value)
{
    if( !(key in this._cache_list[0].map) )
    {
        this._cache_list[0].length++;
    }
    this._cache_list[0].map[key] = value;
    
    if( this._cache_list[0].length >= this._options.max_items )
    {
        for( var i = 0 ; i < this._cache_list.length - 1 ; ++i )
        {
            this._cache_list[i + 1] = this._cache_list[i];
        }
        this._cache_list[0] = {
            length: 0,
            map: {},
        };
    }
};

LRUBounceCache.prototype.hit_rate = function()
{
    var total = this._hit_count + this._miss_count;
    var hit_rate = 0;
    if( total > 0 )
    {
        hit_rate = this._hit_count / total;
    }
    return hit_rate;
};


