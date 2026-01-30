using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CSharpApi.src.interfaces;

namespace CSharpApi.src.model
{
    public abstract class EntityBase : IEntityBase
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public abstract ArgumentException? Validate();
    }
}