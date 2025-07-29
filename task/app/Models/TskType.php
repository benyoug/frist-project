<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TskType extends Model
{
    protected $table = 'tsk_types';

    protected $fillable = [
        'libelle_fr',
        'libelle_ar',
        'abreviation',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $appends = ['libelle'];

    public function getLibelleAttribute(){
        return \Helper::getFieldTranslated($this);
    }

    public function tasks()
    {
        return $this->hasMany(TskTask::class, 'tsk_type_id');
    }
}
