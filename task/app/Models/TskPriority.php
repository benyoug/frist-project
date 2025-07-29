<?php

namespace App\Models;

use App\Dcs\Facades\Helper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskPriority extends Model
{
    use SoftDeletes;
    protected $appends = ['libelle'];

    public function getLibelleAttribute(){
        return Helper::getFieldTranslated($this);
    }
}
