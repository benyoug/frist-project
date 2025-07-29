<?php

namespace App\Models;

use App\Dcs\Facades\Helper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskProject extends Model
{

    use SoftDeletes;

    protected $appends = ['libelle'];
    protected $fillable = [
        'libelle_fr',
        'libelle_ar',
        'tsk_workspace_id',
       ];

    public function tsk_lists()
    {
        return $this->hasMany(TskList::class, 'tsk_project_id');
    }

    
    public function getLibelleAttribute()
    {
        return Helper::getFieldTranslated($this);
    }

    public function tsk_projects_tsk_members()
    {
          return $this->hasMany(TskProjectTskMembers::class, 'tsk_project_id');
    }
}
