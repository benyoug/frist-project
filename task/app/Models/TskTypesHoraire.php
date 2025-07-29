<?php

namespace App\Models;

use App\Dcs\Facades\Helper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskTypesHoraire extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $table = 'tsk_types_horaires';

    protected $fillable = [
        'libelle_fr',
        'libelle_ar',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function getLibelleAttribute(){
        return Helper::getFieldTranslated($this);
    }


}
