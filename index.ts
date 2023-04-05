import * as vsphere from "@pulumi/vsphere";
/*const dc = new vsphere.Datacenter("my-dc", {
  name: "Production-DataCenter",
});*/

const datacenter = vsphere.getDatacenter({
  name: "Datacenter",
});
const dc = vsphere.getDatacenter({ name: "Datacenter" });
const datastoreId = dc.then(dc => vsphere.getDatastore({ name: "SAS-7.2k-R5", datacenterId: dc.id })).then(d => d.id);
const poolId = dc.then(dc => vsphere.getResourcePool({ name: "Iac-Resource-Pool", datacenterId: dc.id })).then(p => p.id);
const networkId = dc.then(dc => vsphere.getNetwork({ name: "VLAN 32", datacenterId: dc.id })).then(n => n.id);
const template = dc.then(dc => vsphere.getVirtualMachine({ name: "Templates/IaC-Ubuntu-Template", datacenterId: dc.id }));

const vm = new vsphere.VirtualMachine("VM-UB-Node1", {
  resourcePoolId: poolId,
  name: "VM-UB-Node1",
  datastoreId: datastoreId,
    folder: "Iac-VMS",
    numCpus: 2,
    memory: 2048,
    guestId: template.then(t => t.guestId),
    networkInterfaces: [{
        networkId: networkId,
        adapterType: template.then(t => t.networkInterfaceTypes[0]),
    }],
    disks: [{
        label: "disk0",
        size: template.then(t => t.disks[0].size),
        eagerlyScrub: template.then(t => t.disks[0].eagerlyScrub),
        thinProvisioned: template.then(t => t.disks[0].thinProvisioned),
    }],
    clone: {
        templateUuid: template.then(t => t.id), 
    },
});


//export let defaultIp = vm.defaultIpAddress;


let  VMmData = datacenter.then(datacenter =>vsphere.getVirtualMachine({
  name: "VM-UB-Node1",
  datacenterId: datacenter.id,
}));


VMmData.then(function(result) {
  console.log(result.defaultIpAddress) // "Some User token"
})