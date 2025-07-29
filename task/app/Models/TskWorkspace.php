<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskWorkspace extends Model
{

    use SoftDeletes;

    protected $table = 'tsk_workspaces';

    protected $fillable = [
        'libelle_fr',
        'libelle_ar',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $appends = ['libelle'];

    function tsk_projects()
    {
        return $this->hasMany(TskProject::class, 'tsk_workspace_id');
    }
    public function getLibelleAttribute(){
        return \Helper::getFieldTranslated($this);
    }

}
